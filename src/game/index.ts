export {
  EVOLUTION_THRESHOLD,
  PET_STATE_STORAGE_KEY,
  applyCareAction,
  createInitialPetState,
  evolutionLabels,
  feedPet,
  getEvolution,
  loadPetState,
  playWithPet,
  recordPetInteraction,
  resetPetState,
  restPet,
  savePetState,
} from "./petState";
export type {
  CareAction,
  PetEvolution,
  PetInteraction,
  PersonalityTraits,
  PetState,
  PetStateOverrides,
} from "./petState";
