import {
  advanceStudyTimer,
  createStudyTimer,
  pauseStudyTimer,
  resetStudyTimer,
  resumeStudyTimer,
  startStudyTimer,
  type StudyTimer,
} from "../../../src/game/studyTimer";
import { applyDelta } from "./careLogic";
import type { PetState } from "./petState";

export const STUDY_PRESETS = [
  { label: "10s demo", durationMs: 10 * 1_000 },
  { label: "1 min", durationMs: 60 * 1_000 },
  { label: "5 min", durationMs: 5 * 60 * 1_000 },
  { label: "25 min", durationMs: 25 * 60 * 1_000 },
] as const;

export function formatStudyTimerDisplay(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1_000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export {
  advanceStudyTimer,
  createStudyTimer,
  pauseStudyTimer,
  resetStudyTimer,
  resumeStudyTimer,
  startStudyTimer,
  type StudyTimer,
};

/** Rewards stay in frontend semantics: hunger grows with need, not fullness. */
export function completeFrontendStudySession(
  timer: StudyTimer,
  pet: PetState,
  now = Date.now(),
): { timer: StudyTimer; pet: PetState; rewarded: boolean } {
  const advancedTimer = advanceStudyTimer(timer, now);
  if (advancedTimer.status !== "completed" || advancedTimer.rewarded) {
    return { timer: advancedTimer, pet, rewarded: false };
  }

  return {
    timer: { ...advancedTimer, rewarded: true },
    pet: applyDelta(pet, { curiosity: +15, happiness: +8 }),
    rewarded: true,
  };
}
