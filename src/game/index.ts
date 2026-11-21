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
export {
  DEFAULT_STUDY_DURATION_MS,
  DEMO_STUDY_DURATION_MS,
  advanceStudyTimer,
  completeStudySession,
  createStudyTimer,
  getStudyTimerMessage,
  pauseStudyTimer,
  resetStudyTimer,
  resumeStudyTimer,
  startStudyTimer,
} from "./studyTimer";
export type {
  StudyCompletionResult,
  StudyTimer,
  StudyTimerOptions,
  StudyTimerStatus,
} from "./studyTimer";
