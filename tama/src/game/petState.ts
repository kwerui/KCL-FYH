import type { PetMode } from "../ai/types";
import type { SpeciesId } from "../art/pets";
import { SPECIES, SPECIES_IDS } from "../art/pets";
import { computeEvolution, type Evolution } from "./evolutionLogic";

export type { Evolution } from "./evolutionLogic";

export type TraitGains = { curiosity: number; playfulness: number; friendship: number };

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
  formChangedAt: number;  // timestamp of last form change (0 = never)
  traitDay: string;       // "YYYY-MM-DD" for daily cap tracking
  traitGains: TraitGains; // trait gains accumulated today
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
  formChangedAt: 0,
  traitDay: "",
  traitGains: { curiosity: 0, playfulness: 0, friendship: 0 },
};

const STORAGE_KEY = "tama_pet";
export const MAX_FACTS = 5;

/** Show the saved nickname when present; old unnamed saves fall back to their species. */
export function resolvePetName(name: unknown, species: SpeciesId): string {
  return typeof name === "string" && name.trim() ? name.trim() : SPECIES[species].name;
}

export const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export function loadPetState(): PetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const merged: PetState = { ...INITIAL_STATE, ...JSON.parse(raw) };
      if (!SPECIES_IDS.includes(merged.species)) merged.species = INITIAL_STATE.species;
      merged.petName = resolvePetName(merged.petName, merged.species);
      merged.asleep = false;
      // Normalise new fields that may be absent in old saves
      merged.formChangedAt = merged.formChangedAt ?? 0;
      merged.traitDay = merged.traitDay ?? "";
      merged.traitGains = {
        curiosity: merged.traitGains?.curiosity ?? 0,
        playfulness: merged.traitGains?.playfulness ?? 0,
        friendship: merged.traitGains?.friendship ?? 0,
      };
      const demoMode = localStorage.getItem("tama_demo") === "1";
      merged.evolution = computeEvolution(merged, merged.evolution, demoMode);
      return applyTimeAway(merged);
    }
  } catch {
    /* corrupted save: start over */
  }
  return { ...INITIAL_STATE };
}

/** A gentle catch-up for time spent away (capped at 12 h, with floors so the pet is never miserable). */
function applyTimeAway(state: PetState): PetState {
  if (!state.hatched) return state;
  const minutes = Math.min(720, (Date.now() - state.lastSaved) / 60000); // 12 h cap
  const steps = Math.floor(minutes / 2);
  if (steps <= 0) return state;
  return {
    ...state,
    hunger: clamp(Math.min(85, state.hunger + steps * 2)),
    energy: clamp(Math.max(20, state.energy - steps)),
    happiness: clamp(Math.max(25, state.happiness - steps)),
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
  const demoMode = localStorage.getItem("tama_demo") === "1";
  const next: PetState = {
    ...state,
    petName: resolvePetName(name.trim().slice(0, 12), species),
    species,
    hatched: true,
    bornAt: Date.now(),
    formChangedAt: 0,
    traitDay: "",
    traitGains: { curiosity: 0, playfulness: 0, friendship: 0 },
  };
  next.evolution = computeEvolution(next, "egg", demoMode);
  return next;
}
