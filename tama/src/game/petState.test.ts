import { describe, expect, it } from "vitest";
import { resolvePetName } from "./petState";

describe("resolvePetName", () => {
  it("uses the species name when a saved nickname is absent or whitespace", () => {
    expect(resolvePetName("", "pebbl")).toBe("Pebbl");
    expect(resolvePetName("   ", "pebbl")).toBe("Pebbl");
  });

  it("preserves an intentionally chosen nickname", () => {
    expect(resolvePetName("d", "pebbl")).toBe("d");
    expect(resolvePetName("Pixrl", "pebbl")).toBe("Pixrl");
  });
});
