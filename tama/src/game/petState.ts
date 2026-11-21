import type { PetMode } from "../ai/types";
import type { SpeciesId } from "../art/pets";
import { SPECIES_IDS } from "../art/pets";
import { computeEvolution, type Evolution } from "./evolutionLogic";

export type { Evolution } from "./evolutionLogic";

export type PetState = {
  petName: string;
  species: SpeciesId;
  hunger: number; // 0-100 (higher = hungrier, bad)
  energy: number; // 0-100 (higher = more energetic, good)
  happiness: number; // 0-100
  mode: PetMode;
  curiosity: number; // 0-100
  playfulness: number; // 0-100
  friendship: number; // 0-100
  evolution: Evolution;
  savedFacts: string[];
  hatched: boolean;
  asleep: boolean;
  bornAt: number;
  lastSaved: number;
};

export const INITIAL_STATE: PetState = {
  petName: "",
  species: "shroomi",
  hunger: 30,
  energy: 80,
  happiness: 70,
  mode: "companion",
  curiosity: 5,
  playfulness: 5,
  friendship: 5,
  evolution: "egg",
  savedFacts: [],
  hatched: false,
  asleep: false,
  bornAt: 0,
  lastSaved: Date.now(),
};

const STORAGE_KEY = "tama_pet";
export const MAX_FACTS = 5;

export const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export function loadPetState(): PetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const merged: PetState = { ...INITIAL_STATE, ...JSON.parse(raw) };
      if (!SPECIES_IDS.includes(merged.species)) merged.species = INITIAL_STATE.species;
      merged.asleep = false;
      merged.evolution = computeEvolution(merged, merged.evolution);
      return applyTimeAway(merged);
    }
  } catch {
    /* corrupted save: start over */
  }
  return { ...INITIAL_STATE };
}

/** A gentle catch-up for time spent away (capped so nobody comes back to a miserable pet). */
function applyTimeAway(state: PetState): PetState {
  if (!state.hatched) return state;
  const minutes = Math.min(120, (Date.now() - state.lastSaved) / 60000);
  const steps = Math.floor(minutes / 2);
  if (steps <= 0) return state;
  return {
    ...state,
    hunger: clamp(Math.min(75, state.hunger + steps * 2)),
    energy: clamp(Math.max(30, state.energy - steps)),
    happiness: clamp(Math.max(35, state.happiness - steps)),
  };
}

export function savePetState(state: PetState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastSaved: Date.now() }));
  } catch {
    /* storage blocked */
  }
}

export function resetPetState(): PetState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return { ...INITIAL_STATE, lastSaved: Date.now() };
}

export function hatchPet(state: PetState, name: string, species: SpeciesId): PetState {
  const next: PetState = {
    ...state,
    petName: name.trim().slice(0, 12),
    species,
    hatched: true,
    bornAt: Date.now(),
  };
  next.evolution = computeEvolution(next, "egg");
  return next;
}
