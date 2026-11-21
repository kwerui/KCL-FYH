export const PET_STATE_STORAGE_KEY = "tama.pet-state";
export const EVOLUTION_THRESHOLD = 10;

export type PetEvolution = "hatchling" | "scholar" | "chaos-sprite" | "buddy";
export type CareAction = "feed" | "play" | "rest";
export type PetInteraction = "study" | "chat";

export type PersonalityTraits = {
  curiosity: number;
  playfulness: number;
  friendship: number;
};

export type PetState = PersonalityTraits & {
  /** A fullness meter: higher values mean the pet has been fed recently. */
  hunger: number;
  energy: number;
  happiness: number;
  evolution: PetEvolution;
};

export type PetStateOverrides = Partial<Omit<PetState, "evolution">>;

export const evolutionLabels: Record<PetEvolution, string> = {
  hatchling: "Hatchling",
  scholar: "Scholar",
  "chaos-sprite": "Chaos Sprite",
  buddy: "Buddy",
};

const initialStats: Omit<PetState, "evolution"> = {
  hunger: 70,
  energy: 70,
  happiness: 70,
  curiosity: 0,
  playfulness: 0,
  friendship: 0,
};

function clampStat(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Returns the winning evolution, resolving tied traits in the listed order. */
export function getEvolution(traits: PersonalityTraits): PetEvolution {
  const rankedTraits: Array<[keyof PersonalityTraits, PetEvolution]> = [
    ["curiosity", "scholar"],
    ["playfulness", "chaos-sprite"],
    ["friendship", "buddy"],
  ];

  const [leadingTrait, evolution] = rankedTraits.reduce((leader, candidate) =>
    traits[candidate[0]] > traits[leader[0]] ? candidate : leader,
  );

  return traits[leadingTrait] >= EVOLUTION_THRESHOLD ? evolution : "hatchling";
}

/** Creates a normalized state so every stat remains an integer between 0 and 100. */
export function createInitialPetState(overrides: PetStateOverrides = {}): PetState {
  const stateWithoutEvolution = {
    hunger: clampStat(overrides.hunger, initialStats.hunger),
    energy: clampStat(overrides.energy, initialStats.energy),
    happiness: clampStat(overrides.happiness, initialStats.happiness),
    curiosity: clampStat(overrides.curiosity, initialStats.curiosity),
    playfulness: clampStat(overrides.playfulness, initialStats.playfulness),
    friendship: clampStat(overrides.friendship, initialStats.friendship),
  };

  return {
    ...stateWithoutEvolution,
    evolution: getEvolution(stateWithoutEvolution),
  };
}

function updateState(state: PetState, changes: PetStateOverrides): PetState {
  return createInitialPetState({ ...state, ...changes });
}

/** Feed the pet: restores fullness and builds a small amount of friendship. */
export function feedPet(state: PetState): PetState {
  return updateState(state, {
    hunger: state.hunger + 20,
    happiness: state.happiness + 2,
    friendship: state.friendship + 1,
  });
}

/** Play with the pet: improves mood and playfulness at the cost of energy/fullness. */
export function playWithPet(state: PetState): PetState {
  return updateState(state, {
    hunger: state.hunger - 5,
    energy: state.energy - 15,
    happiness: state.happiness + 15,
    playfulness: state.playfulness + 3,
    friendship: state.friendship + 1,
  });
}

/** Let the pet rest: restores energy and a little happiness. */
export function restPet(state: PetState): PetState {
  return updateState(state, {
    hunger: state.hunger - 5,
    energy: state.energy + 25,
    happiness: state.happiness + 3,
  });
}

export function applyCareAction(state: PetState, action: CareAction): PetState {
  switch (action) {
    case "feed":
      return feedPet(state);
    case "play":
      return playWithPet(state);
    case "rest":
      return restPet(state);
  }
}

/**
 * Records non-care game events without coupling the state module to an AI or UI.
 * Call this only after the player completes the corresponding interaction.
 */
export function recordPetInteraction(state: PetState, interaction: PetInteraction): PetState {
  switch (interaction) {
    case "study":
      return updateState(state, {
        energy: state.energy - 5,
        happiness: state.happiness + 2,
        curiosity: state.curiosity + 3,
      });
    case "chat":
      return updateState(state, {
        happiness: state.happiness + 3,
        friendship: state.friendship + 3,
      });
  }
}

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function restoreState(parsed: unknown): PetState | null {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  return createInitialPetState(parsed as PetStateOverrides);
}

/** Saves the state locally. Returns false if storage is unavailable or full. */
export function savePetState(state: PetState, storage: Storage | null = getBrowserStorage()): boolean {
  if (!storage) return false;

  try {
    storage.setItem(PET_STATE_STORAGE_KEY, JSON.stringify(createInitialPetState(state)));
    return true;
  } catch {
    return false;
  }
}

/** Restores a normalized state, falling back safely when no valid save exists. */
export function loadPetState(storage: Storage | null = getBrowserStorage()): PetState {
  if (!storage) return createInitialPetState();

  try {
    const serializedState = storage.getItem(PET_STATE_STORAGE_KEY);
    if (!serializedState) return createInitialPetState();
    return restoreState(JSON.parse(serializedState)) ?? createInitialPetState();
  } catch {
    return createInitialPetState();
  }
}

/** Removes a saved game and returns a fresh hatchling state. */
export function resetPetState(storage: Storage | null = getBrowserStorage()): PetState {
  try {
    storage?.removeItem(PET_STATE_STORAGE_KEY);
  } catch {
    // A reset should still return a usable fresh state if storage is unavailable.
  }

  return createInitialPetState();
}
