import type { PetMode, PetRequest } from "../src/ai/types.js";
export { CLIENT_TIMEOUT_MS, GEMINI_TIMEOUT_MS } from "../src/ai/timeouts.js";

export const GEMINI_THINKING_LEVEL = "MINIMAL";
export const GEMINI_MAX_OUTPUT_TOKENS = 96;

const modes = new Set<PetMode>(["silly", "serious", "study", "companion"]);

type ValidRequest = { ok: true; value: PetRequest };
type InvalidRequest = { ok: false; error: string };

function isPercent(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

export function validatePetRequest(body: unknown): ValidRequest | InvalidRequest {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Request body must be an object" };
  }

  const input = body as Partial<PetRequest>;
  if (typeof input.message !== "string" || !input.message.trim()) {
    return { ok: false, error: "Missing message" };
  }
  if (input.message.length > 500) return { ok: false, error: "Message too long" };
  if (input.mode !== undefined && !modes.has(input.mode)) return { ok: false, error: "Invalid mode" };
  if (input.petName !== undefined && (typeof input.petName !== "string" || input.petName.length > 80)) {
    return { ok: false, error: "Invalid pet name" };
  }
  if (input.memories !== undefined && (!Array.isArray(input.memories) || input.memories.some((memory) => typeof memory !== "string" || memory.length > 500))) {
    return { ok: false, error: "Invalid memories" };
  }
  for (const field of ["hunger", "energy", "happiness"] as const) {
    if (input[field] !== undefined && !isPercent(input[field])) return { ok: false, error: `Invalid ${field}` };
  }

  const personality = input.personality;
  if (personality !== undefined && (
    typeof personality !== "object" || personality === null ||
    !isPercent(personality.curiosity) || !isPercent(personality.playfulness) || !isPercent(personality.friendship)
  )) {
    return { ok: false, error: "Invalid personality" };
  }

  return {
    ok: true,
    value: {
      message: input.message,
      mode: input.mode ?? "companion",
      petName: input.petName ?? "Tama",
      personality: personality ?? { curiosity: 50, playfulness: 50, friendship: 50 },
      memories: input.memories ?? [],
      hunger: input.hunger ?? 50,
      energy: input.energy ?? 80,
      happiness: input.happiness ?? 70,
    },
  };
}
