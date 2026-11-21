import { recordPetInteraction, type PetState } from "./petState";

export const DEFAULT_STUDY_DURATION_MS = 25 * 60 * 1_000;
export const DEMO_STUDY_DURATION_MS = 10 * 1_000;

export type StudyTimerStatus = "ready" | "running" | "paused" | "completed";

export type StudyTimer = {
  durationMs: number;
  remainingMs: number;
  status: StudyTimerStatus;
  /** Epoch timestamp for the current running segment; null while paused or finished. */
  startedAt: number | null;
  /** Guards the pet-state reward after completion. */
  rewarded: boolean;
};

export type StudyTimerOptions = {
  durationMs?: number;
};

export type StudyCompletionResult = {
  timer: StudyTimer;
  petState: PetState;
  rewarded: boolean;
  /** Plain text suitable for a UI status area or `speechSynthesis`. */
  message: string;
};

function normaliseDuration(durationMs: number | undefined): number {
  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs <= 0) {
    return DEFAULT_STUDY_DURATION_MS;
  }

  return Math.floor(durationMs);
}

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export function createStudyTimer(options: StudyTimerOptions = {}): StudyTimer {
  const durationMs = normaliseDuration(options.durationMs);
  return { durationMs, remainingMs: durationMs, status: "ready", startedAt: null, rewarded: false };
}

export function startStudyTimer(timer: StudyTimer, now = Date.now()): StudyTimer {
  if (timer.status !== "ready") return timer;
  return { ...timer, status: "running", startedAt: now };
}

/**
 * Updates remaining time from a wall-clock timestamp rather than interval ticks.
 * The caller can run this after interval callbacks or a visibility change.
 */
export function advanceStudyTimer(timer: StudyTimer, now = Date.now()): StudyTimer {
  if (timer.status !== "running" || timer.startedAt === null) return timer;

  const elapsedMs = Math.max(0, now - timer.startedAt);
  const remainingMs = Math.max(0, timer.remainingMs - elapsedMs);
  if (remainingMs === 0) {
    return { ...timer, remainingMs: 0, status: "completed", startedAt: null };
  }

  return { ...timer, remainingMs, startedAt: now };
}

export function pauseStudyTimer(timer: StudyTimer, now = Date.now()): StudyTimer {
  const advanced = advanceStudyTimer(timer, now);
  if (advanced.status !== "running") return advanced;
  return { ...advanced, status: "paused", startedAt: null };
}

export function resumeStudyTimer(timer: StudyTimer, now = Date.now()): StudyTimer {
  if (timer.status !== "paused") return timer;
  return { ...timer, status: "running", startedAt: now };
}

export function resetStudyTimer(timer: StudyTimer): StudyTimer {
  return createStudyTimer({ durationMs: timer.durationMs });
}

export function getStudyTimerMessage(timer: StudyTimer): string {
  switch (timer.status) {
    case "ready":
      return `Ready for a ${formatDuration(timer.durationMs)} focus session.`;
    case "running":
      return `Focus session in progress: ${formatDuration(timer.remainingMs)} remaining.`;
    case "paused":
      return `Focus session paused with ${formatDuration(timer.remainingMs)} remaining.`;
    case "completed":
      return "Focus session complete! Your pet's curiosity grew.";
  }
}

/**
 * Advances the timer and applies the study reward once, when and only when it
 * reaches completion. Repeated calls leave an already rewarded state unchanged.
 */
export function completeStudySession(
  timer: StudyTimer,
  petState: PetState,
  now = Date.now(),
): StudyCompletionResult {
  const advancedTimer = advanceStudyTimer(timer, now);
  const shouldReward = advancedTimer.status === "completed" && !advancedTimer.rewarded;

  if (!shouldReward) {
    return {
      timer: advancedTimer,
      petState,
      rewarded: false,
      message: getStudyTimerMessage(advancedTimer),
    };
  }

  const completedTimer = { ...advancedTimer, rewarded: true };
  return {
    timer: completedTimer,
    petState: recordPetInteraction(petState, "study"),
    rewarded: true,
    message: getStudyTimerMessage(completedTimer),
  };
}
