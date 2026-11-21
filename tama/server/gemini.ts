import { localFallbackReply } from "../src/game/dialogueFallback.js";
import type { PetRequest, PetResponse } from "../src/ai/types.js";

const emotions = new Set<PetResponse["emotion"]>([
  "happy", "sad", "excited", "thinking", "sleepy", "hungry",
]);
const actions = new Set<NonNullable<PetResponse["suggestedAction"]>>(["feed", "play", "rest"]);

export const petResponseJsonSchema = {
  type: "object",
  properties: {
    reply: { type: "string", description: "A short in-character reply, at most 400 characters." },
    emotion: { type: "string", enum: [...emotions] },
    suggestedAction: {
      anyOf: [
        { type: "string", enum: ["feed", "play", "rest"] },
        { type: "null" },
      ],
    },
  },
  required: ["reply", "emotion", "suggestedAction"],
  additionalProperties: false,
} as const;

export function parseGeminiPetResponse(rawText: string): PetResponse | null {
  try {
    // Gemini structured output should be plain JSON, but accepting a fence keeps
    // the proxy compatible with model versions that still wrap JSON in Markdown.
    const json = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(json) as Partial<PetResponse>;
    if (
      typeof parsed.reply !== "string" ||
      !parsed.reply.trim() ||
      parsed.reply.length > 400 ||
      !emotions.has(parsed.emotion as PetResponse["emotion"]) ||
      !(
        parsed.suggestedAction === null ||
        parsed.suggestedAction === undefined ||
        actions.has(parsed.suggestedAction as NonNullable<PetResponse["suggestedAction"]>)
      )
    ) {
      return null;
    }

    return {
      reply: parsed.reply.trim(),
      emotion: parsed.emotion as PetResponse["emotion"],
      suggestedAction: parsed.suggestedAction ?? null,
    };
  } catch {
    return null;
  }
}

export function fallbackPetResponse(request: PetRequest): PetResponse {
  return localFallbackReply(request);
}
