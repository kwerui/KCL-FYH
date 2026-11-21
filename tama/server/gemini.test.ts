import { describe, expect, it } from "vitest";
import { fallbackPetResponse, parseGeminiPetResponse } from "./gemini";
import {
  CLIENT_TIMEOUT_MS,
  GEMINI_MAX_OUTPUT_TOKENS,
  GEMINI_THINKING_LEVEL,
  GEMINI_TIMEOUT_MS,
  validatePetRequest,
} from "./chat";

describe("Gemini PetResponse parsing", () => {
  it("uses a 20 second server deadline and leaves the browser five seconds to receive its response", () => {
    expect(GEMINI_TIMEOUT_MS).toBe(20_000);
    expect(CLIENT_TIMEOUT_MS).toBeGreaterThan(GEMINI_TIMEOUT_MS);
  });

  it("uses minimal thinking and a short output budget for pet conversations", () => {
    expect(GEMINI_THINKING_LEVEL).toBe("MINIMAL");
    expect(GEMINI_MAX_OUTPUT_TOKENS).toBe(96);
  });

  it("rejects malformed request fields before prompt construction", () => {
    expect(validatePetRequest({ message: "hi", memories: "not an array" })).toMatchObject({ ok: false });
    expect(validatePetRequest({ message: "hi", hunger: 101 })).toMatchObject({ ok: false });
  });

  it("normalizes omitted optional request fields to safe defaults", () => {
    expect(validatePetRequest({ message: "hello" })).toMatchObject({
      ok: true,
      value: { message: "hello", mode: "companion", memories: [] },
    });
  });

  it("accepts a valid structured Gemini response", () => {
    expect(parseGeminiPetResponse('{"reply":"Let us learn!","emotion":"excited","suggestedAction":"rest"}')).toEqual({
      reply: "Let us learn!",
      emotion: "excited",
      suggestedAction: "rest",
    });
  });

  it("accepts a JSON response wrapped in a markdown fence", () => {
    expect(parseGeminiPetResponse('```json\n{"reply":"Hello!","emotion":"happy","suggestedAction":null}\n```')).toEqual({
      reply: "Hello!",
      emotion: "happy",
      suggestedAction: null,
    });
  });

  it("rejects malformed or out-of-contract model output", () => {
    expect(parseGeminiPetResponse("not json")).toBeNull();
    expect(parseGeminiPetResponse('{"reply":"Hi","emotion":"mischievous","suggestedAction":null}')).toBeNull();
    expect(parseGeminiPetResponse('{"reply":"Hi","emotion":"happy","suggestedAction":"dance"}')).toBeNull();
  });

  it("returns a valid scripted fallback when Gemini is unavailable", () => {
    expect(fallbackPetResponse({
      message: "hello",
      mode: "companion",
      petName: "Pixrl",
      personality: { curiosity: 50, playfulness: 50, friendship: 50 },
      memories: [],
      hunger: 50,
      energy: 80,
      happiness: 70,
    })).toMatchObject({ emotion: "happy", suggestedAction: null });
  });
});
