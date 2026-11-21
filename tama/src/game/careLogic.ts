import { clamp, type PetState } from "./petState";
import { computeEvolution } from "./evolutionLogic";

export type CareAction = "feed" | "play" | "rest" | "pat";

type StatDelta = Partial<
  Pick<PetState, "hunger" | "energy" | "happiness" | "curiosity" | "playfulness" | "friendship">
>;

const ACTION_EFFECTS: Record<CareAction, StatDelta> = {
  feed: { hunger: -35, happiness: +6, friendship: +2 },
  play: { hunger: +8, energy: -12, happiness: +18, playfulness: +7 },
  rest: { energy: +40, hunger: +4, happiness: +3 },
  pat: { happiness: +5, friendship: +4 },
};

const DAILY_TRAIT_CAP = 20;

export function canPlay(state: PetState): boolean {
  return state.energy >= 15;
}

/** Cap a positive trait delta against today's accumulated gains. Returns [actual delta, new accumulated]. */
function capGain(requested: number, accumulated: number): [number, number] {
  if (requested <= 0) return [requested, accumulated];
  const actual = Math.min(requested, Math.max(0, DAILY_TRAIT_CAP - accumulated));
  return [actual, accumulated + actual];
}

export function applyDelta(state: PetState, delta: StatDelta, demoMode = false, now = Date.now()): PetState {
  // Reset daily trait gains when the calendar date changes
  const today = new Date(now).toISOString().slice(0, 10);
  const baseGains =
    state.traitDay === today
      ? state.traitGains
      : { curiosity: 0, playfulness: 0, friendship: 0 };

  // Apply daily cap to trait gains (skipped in demo mode)
  let dCuriosity = delta.curiosity ?? 0;
  let dPlayfulness = delta.playfulness ?? 0;
  let dFriendship = delta.friendship ?? 0;
  const newGains = { ...baseGains };

  if (!demoMode) {
    [dCuriosity, newGains.curiosity] = capGain(dCuriosity, baseGains.curiosity);
    [dPlayfulness, newGains.playfulness] = capGain(dPlayfulness, baseGains.playfulness);
    [dFriendship, newGains.friendship] = capGain(dFriendship, baseGains.friendship);
  }

  const next: PetState = {
    ...state,
    hunger: clamp(state.hunger + (delta.hunger ?? 0)),
    energy: clamp(state.energy + (delta.energy ?? 0)),
    happiness: clamp(state.happiness + (delta.happiness ?? 0)),
    curiosity: clamp(state.curiosity + dCuriosity),
    playfulness: clamp(state.playfulness + dPlayfulness),
    friendship: clamp(state.friendship + dFriendship),
    traitDay: today,
    traitGains: newGains,
  };

  const newEvolution = computeEvolution(next, state.evolution, demoMode, now);
  if (newEvolution !== state.evolution) {
    next.formChangedAt = now;
  }
  next.evolution = newEvolution;
  return next;
}

/** Called every 30 s of play time. Sleeping restores energy instead of draining it. */
export function applyPassiveDecay(state: PetState, demoMode = false): PetState {
  if (!state.hatched) return state;
  if (state.asleep) return applyDelta(state, { energy: +6, hunger: +1 }, demoMode);
  return applyDelta(state, {
    hunger: +3,
    energy: -2,
    happiness: state.hunger > 70 || state.energy < 25 ? -3 : -1,
  }, demoMode);
}

export function applyCareAction(state: PetState, action: CareAction, demoMode = false): PetState {
  // Play does nothing if the pet is too tired
  if (action === "play" && !canPlay(state)) return state;
  const next = applyDelta(state, ACTION_EFFECTS[action], demoMode);
  if (action === "rest") return { ...next, asleep: true };
  return { ...next, asleep: false };
}

export function applyConversationBonus(state: PetState, mode: string, demoMode = false): PetState {
  const bonus: StatDelta =
    mode === "study"
      ? { curiosity: +5, happiness: +2 }
      : mode === "silly"
        ? { playfulness: +5, happiness: +4 }
        : mode === "companion"
          ? { friendship: +5, happiness: +4 }
          : { curiosity: +2, happiness: +2 };
  return applyDelta(state, bonus, demoMode);
}

export { ACTION_EFFECTS };
