import { describe, expect, it } from "vitest";
import {
  EVOLUTION_THRESHOLD,
  createInitialPetState,
  feedPet,
  loadPetState,
  playWithPet,
  recordPetInteraction,
  resetPetState,
  restPet,
  savePetState,
} from "./petState";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("care actions", () => {
  it("caps Feed stats at 100 and rewards friendship", () => {
    const state = feedPet(createInitialPetState({ hunger: 95, happiness: 99 }));

    expect(state.hunger).toBe(100);
    expect(state.happiness).toBe(100);
    expect(state.friendship).toBe(1);
  });

  it("keeps Play stats within bounds while improving happiness and playfulness", () => {
    const state = playWithPet(
      createInitialPetState({ hunger: 3, energy: 4, happiness: 95, playfulness: 8 }),
    );

    expect(state.hunger).toBe(0);
    expect(state.energy).toBe(0);
    expect(state.happiness).toBe(100);
    expect(state.playfulness).toBe(EVOLUTION_THRESHOLD + 1);
    expect(state.evolution).toBe("chaos-sprite");
  });

  it("restores energy without exceeding the stat boundary", () => {
    const state = restPet(createInitialPetState({ hunger: 2, energy: 90, happiness: 99 }));

    expect(state.hunger).toBe(0);
    expect(state.energy).toBe(100);
    expect(state.happiness).toBe(100);
  });
});

describe("personality evolution", () => {
  it("selects the leading eligible trait with stable trait-order tie breaking", () => {
    const state = createInitialPetState({
      curiosity: EVOLUTION_THRESHOLD,
      playfulness: EVOLUTION_THRESHOLD,
      friendship: EVOLUTION_THRESHOLD,
    });

    expect(state.evolution).toBe("scholar");
  });

  it("awards a Scholar evolution after study interactions", () => {
    let state = createInitialPetState();
    for (let count = 0; count < 4; count += 1) {
      state = recordPetInteraction(state, "study");
    }

    expect(state.curiosity).toBe(EVOLUTION_THRESHOLD + 2);
    expect(state.evolution).toBe("scholar");
  });

  it("supports Buddy when friendship is the leading eligible trait", () => {
    const state = createInitialPetState({ friendship: EVOLUTION_THRESHOLD });

    expect(state.evolution).toBe("buddy");
  });
});

describe("persistence", () => {
  it("saves and restores a complete state", () => {
    const storage = new MemoryStorage();
    const state = recordPetInteraction(feedPet(createInitialPetState()), "chat");

    expect(savePetState(state, storage)).toBe(true);
    expect(loadPetState(storage)).toEqual(state);
  });

  it("returns a safe initial state when stored data is malformed", () => {
    const storage = new MemoryStorage();
    storage.setItem("tama.pet-state", "not json");

    expect(loadPetState(storage)).toEqual(createInitialPetState());
  });

  it("clears persisted state when reset", () => {
    const storage = new MemoryStorage();
    savePetState(feedPet(createInitialPetState()), storage);

    expect(resetPetState(storage)).toEqual(createInitialPetState());
    expect(storage.length).toBe(0);
  });
});
