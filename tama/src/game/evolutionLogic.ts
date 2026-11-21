/**
 * Personality evolution: the leading trait decides the form.
 *
 * Time gates (real-clock):
 *   - A hatchling can only evolve after 24 real hours (1 min in demo mode).
 *   - After evolving, the pet can only switch form once per 24 hours (30 s in demo).
 *   - A form switch also requires the new leading trait to exceed the current one by 10+.
 *
 * Trait threshold to trigger first evolution: 25.
 */

export type Evolution = "egg" | "hatchling" | "scholar" | "chaos_sprite" | "buddy";
export type Trait = "curiosity" | "playfulness" | "friendship";

export const EVOLUTION_THRESHOLD = 25;
const SWITCH_MARGIN = 10;

const HATCH_AGE_MS = 24 * 60 * 60 * 1000; // 24 real hours
const DEMO_HATCH_AGE_MS = 60 * 1000;       // 1 minute in demo mode
const SWITCH_GAP_MS = 24 * 60 * 60 * 1000; // 24 h between form switches
const DEMO_SWITCH_GAP_MS = 30 * 1000;       // 30 s in demo mode

export const FORM_FOR_TRAIT: Record<Trait, Evolution> = {
  curiosity: "scholar",
  playfulness: "chaos_sprite",
  friendship: "buddy",
};

export const TRAIT_FOR_FORM: Partial<Record<Evolution, Trait>> = {
  scholar: "curiosity",
  chaos_sprite: "playfulness",
  buddy: "friendship",
};

export const FORM_INFO: Record<Evolution, { name: string; blurb: string }> = {
  egg: { name: "Egg", blurb: "Something is wriggling in there." },
  hatchling: { name: "Hatchling", blurb: "Brand new. Who will it become?" },
  scholar: { name: "Scholar", blurb: "Curiosity led. Loves questions and focus sessions." },
  chaos_sprite: { name: "Chaos Sprite", blurb: "Playfulness led. Pure bouncy chaos." },
  buddy: { name: "Buddy", blurb: "Friendship led. Warm, loyal, a great listener." },
};

type EvoInput = {
  hatched: boolean;
  bornAt: number;
  formChangedAt: number;
  curiosity: number;
  playfulness: number;
  friendship: number;
};

export function leadingTrait(t: Record<Trait, number>): Trait {
  const order: Trait[] = ["curiosity", "playfulness", "friendship"];
  return order.reduce((best, k) => (t[k] > t[best] ? k : best), order[0]);
}

export function computeEvolution(
  t: EvoInput,
  current: Evolution,
  demoMode = false,
  now = Date.now(),
): Evolution {
  if (!t.hatched) return "egg";

  const minAge = demoMode ? DEMO_HATCH_AGE_MS : HATCH_AGE_MS;
  if (now - t.bornAt < minAge) return "hatchling";

  const lead = leadingTrait(t);
  const leadValue = t[lead];
  const currentTrait = TRAIT_FOR_FORM[current];

  if (!currentTrait) {
    // Still a hatchling (or egg form) — evolve once leading trait hits threshold
    return leadValue >= EVOLUTION_THRESHOLD ? FORM_FOR_TRAIT[lead] : "hatchling";
  }

  // Already evolved: switch form only if the new leader is ahead by SWITCH_MARGIN
  // AND enough time has passed since the last form change
  const switchGap = demoMode ? DEMO_SWITCH_GAP_MS : SWITCH_GAP_MS;
  if (
    lead !== currentTrait &&
    leadValue >= t[currentTrait] + SWITCH_MARGIN &&
    now - (t.formChangedAt || 0) >= switchGap
  ) {
    return FORM_FOR_TRAIT[lead];
  }
  return current;
}

export function evolutionProgress(t: Record<Trait, number>): number {
  return Math.min(1, Math.max(t.curiosity, t.playfulness, t.friendship) / EVOLUTION_THRESHOLD);
}

/** Milliseconds until the pet is old enough to evolve. 0 means it can already evolve. */
export function msUntilCanEvolve(bornAt: number, demoMode = false, now = Date.now()): number {
  const minAge = demoMode ? DEMO_HATCH_AGE_MS : HATCH_AGE_MS;
  return Math.max(0, bornAt + minAge - now);
}

/** Format a millisecond duration as "Xh Ym", "Ym", or "ready". */
export function formatTimeUntil(ms: number): string {
  if (ms <= 0) return "ready";
  const totalMins = Math.ceil(ms / 60_000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
