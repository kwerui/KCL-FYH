import { describe, expect, it } from "vitest";
import { createStudyTimer, resetStudyTimer, startStudyTimer } from "./studyTimer";
import {
  STUDY_PRESETS,
  completeFrontendStudySession,
  formatStudyTimerDisplay,
} from "../../tama/src/game/studyTimer";
import type { PetState } from "../../tama/src/game/petState";

const hatchedPet = (): PetState => ({
  petName: "Tama",
  species: "shroomi",
  hunger: 30,
  energy: 80,
  happiness: 70,
  mode: "study",
  curiosity: 20,
  playfulness: 5,
  friendship: 5,
  evolution: "hatchling",
  savedFacts: [],
  hatched: true,
  asleep: false,
  bornAt: 0,
  lastSaved: 0,
});

describe("frontend study timer integration", () => {
  it("uses timestamp completion while preserving frontend rewards and hunger semantics", () => {
    const started = startStudyTimer(createStudyTimer({ durationMs: 1_000 }), 0);
    const result = completeFrontendStudySession(started, hatchedPet(), 60_000);

    expect(result.timer).toMatchObject({ status: "completed", remainingMs: 0, rewarded: true });
    expect(result.rewarded).toBe(true);
    expect(result.pet).toMatchObject({ curiosity: 35, happiness: 78, hunger: 30, evolution: "scholar" });
  });

  it("does not award twice when duplicate completion checks occur", () => {
    const first = completeFrontendStudySession(
      startStudyTimer(createStudyTimer({ durationMs: 1_000 }), 0),
      hatchedPet(),
      1_000,
    );
    const repeated = completeFrontendStudySession(first.timer, first.pet, 2_000);

    expect(repeated.rewarded).toBe(false);
    expect(repeated.pet).toEqual(first.pet);
  });

  it("restarts each selected duration in milliseconds with the correct display", () => {
    const expectedDisplays = ["00:10", "01:00", "05:00", "25:00"];

    STUDY_PRESETS.forEach((preset, index) => {
      const completed = {
        ...createStudyTimer({ durationMs: preset.durationMs }),
        status: "completed" as const,
        remainingMs: 0,
      };
      const restarted = resetStudyTimer(completed);

      expect(restarted.durationMs).toBe(preset.durationMs);
      expect(restarted.remainingMs).toBe(preset.durationMs);
      expect(formatStudyTimerDisplay(restarted.remainingMs)).toBe(expectedDisplays[index]);
    });
  });
});
