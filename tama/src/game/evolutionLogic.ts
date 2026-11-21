/**
 * Personality evolution: the leading trait decides the form.
 * Demo-friendly threshold, plus hysteresis so the pet doesn't flicker between
 * forms when two traits are neck and neck.
 */

export type Evolution = "egg" | "hatchling" | "scholar" | "chaos_sprite" | "buddy";
export type Trait = "curiosity" | "playfulness" | "friendship";

export const EVOLUTION_THRESHOLD = 30;
const SWITCH_MARGIN = 10;

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

type Traits = { hatched: boolean } & Record<Trait, number>;

export function leadingTrait(t: Record<Trait, number>): Trait {
  const order: Trait[] = ["curiosity", "playfulness", "friendship"];
  return order.reduce((best, k) => (t[k] > t[best] ? k : best), order[0]);
}

export function computeEvolution(t: Traits, current: Evolution): Evolution {
  if (!t.hatched) return "egg";
  const lead = leadingTrait(t);
  const leadValue = t[lead];
  const currentTrait = TRAIT_FOR_FORM[current];

  if (!currentTrait) {
    return leadValue >= EVOLUTION_THRESHOLD ? FORM_FOR_TRAIT[lead] : "hatchling";
  }
  // Already evolved: only change form if another trait clearly overtakes.
  if (lead !== currentTrait && leadValue >= t[currentTrait] + SWITCH_MARGIN) {
    return FORM_FOR_TRAIT[lead];
  }
  return current;
}

export function evolutionProgress(t: Record<Trait, number>): number {
  return Math.min(1, Math.max(t.curiosity, t.playfulness, t.friendship) / EVOLUTION_THRESHOLD);
}
