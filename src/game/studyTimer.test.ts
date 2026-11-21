import { describe, expect, it } from "vitest";
import { createInitialPetState } from "./petState";
import {
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

describe("study timer lifecycle", () => {
  it("starts with the standard 25-minute duration and supports a short demo", () => {
    expect(createStudyTimer().remainingMs).toBe(DEFAULT_STUDY_DURATION_MS);
    expect(createStudyTimer({ durationMs: DEMO_STUDY_DURATION_MS }).remainingMs).toBe(
      DEMO_STUDY_DURATION_MS,
    );
  });

  it("starts, pauses, resumes, and resets without counting paused time", () => {
    const ready = createStudyTimer({ durationMs: 1_000 });
    const started = startStudyTimer(ready, 1_000);
    const paused = pauseStudyTimer(started, 1_400);
    const resumed = resumeStudyTimer(paused, 9_000);
    const progressed = advanceStudyTimer(resumed, 9_600);

    expect(paused).toMatchObject({ status: "paused", remainingMs: 600 });
    expect(resumed).toMatchObject({ status: "running", remainingMs: 600 });
    expect(progressed).toMatchObject({ status: "completed", remainingMs: 0 });
    expect(resetStudyTimer(progressed)).toMatchObject({
      status: "ready",
      remainingMs: 1_000,
      rewarded: false,
    });
  });

  it("calculates elapsed time from timestamps after an inactive tab", () => {
    const started = startStudyTimer(createStudyTimer({ durationMs: 1_000 }), 0);

    expect(advanceStudyTimer(started, 60_000)).toMatchObject({
      status: "completed",
      remainingMs: 0,
    });
  });
});

describe("study completion", () => {
  it("rewards curiosity exactly once when a session completes", () => {
    const pet = createInitialPetState();
    const started = startStudyTimer(createStudyTimer({ durationMs: 1_000 }), 0);

    const firstCompletion = completeStudySession(started, pet, 1_000);
    const repeatedCompletion = completeStudySession(firstCompletion.timer, firstCompletion.petState, 2_000);

    expect(firstCompletion.timer).toMatchObject({ status: "completed", rewarded: true });
    expect(firstCompletion.rewarded).toBe(true);
    expect(firstCompletion.petState.curiosity).toBe(3);
    expect(repeatedCompletion.rewarded).toBe(false);
    expect(repeatedCompletion.petState).toEqual(firstCompletion.petState);
  });

  it("provides status and completion messages for display or speech", () => {
    const ready = createStudyTimer({ durationMs: 1_000 });
    const completed = completeStudySession(startStudyTimer(ready, 0), createInitialPetState(), 1_000);

    expect(getStudyTimerMessage(ready)).toContain("Ready");
    expect(completed.message).toContain("complete");
  });
});
