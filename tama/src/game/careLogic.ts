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

export function applyDelta(state: PetState, delta: StatDelta): PetState {
  const next: PetState = {
    ...state,
    hunger: clamp(state.hunger + (delta.hunger ?? 0)),
    energy: clamp(state.energy + (delta.energy ?? 0)),
    happiness: clamp(state.happiness + (delta.happiness ?? 0)),
    curiosity: clamp(state.curiosity + (delta.curiosity ?? 0)),
    playfulness: clamp(state.playfulness + (delta.playfulness ?? 0)),
    friendship: clamp(state.friendship + (delta.friendship ?? 0)),
  };
  next.evolution = computeEvolution(next, state.evolution);
  return next;
}

/** Called every 30s of play time. Sleeping restores energy instead of draining it. */
export function applyPassiveDecay(state: PetState): PetState {
  if (!state.hatched) return state;
  if (state.asleep) return applyDelta(state, { energy: +6, hunger: +1 });
  return applyDelta(state, {
    hunger: +3,
    energy: -2,
    happiness: state.hunger > 70 || state.energy < 25 ? -3 : -1,
  });
}

export function applyCareAction(state: PetState, action: CareAction): PetState {
  const next = applyDelta(state, ACTION_EFFECTS[action]);
  if (action === "rest") return { ...next, asleep: true };
  return { ...next, asleep: false };
}

export function applyConversationBonus(state: PetState, mode: string): PetState {
  const bonus: StatDelta =
    mode === "study"
      ? { curiosity: +5, happiness: +2 }
      : mode === "silly"
        ? { playfulness: +5, happiness: +4 }
        : mode === "companion"
          ? { friendship: +5, happiness: +4 }
          : { curiosity: +2, happiness: +2 };
  return applyDelta(state, bonus);
}

export { ACTION_EFFECTS };
