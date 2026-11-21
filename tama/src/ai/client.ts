/**
 * AI client — sends requests to our secure backend proxy, falls back to local dialogue.
 * Never exposes the API key: all LLM calls go through /api/chat on the server.
 */

import type { PetRequest, PetResponse } from "./types";
import { localFallbackReply } from "../game/dialogueFallback";
import { CLIENT_TIMEOUT_MS } from "./timeouts";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
export type PetReplyResult = { response: PetResponse; source: "gemini" | "fallback" };

async function fetchFromServer(request: PetRequest): Promise<PetReplyResult> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`Server error: ${res.status}`);

  const data = await res.json() as Partial<PetResponse>;
  // Validate shape
  if (
    typeof data.reply !== "string" ||
    !["happy", "sad", "excited", "thinking", "sleepy", "hungry"].includes(data.emotion as string) ||
    !["feed", "play", "rest", null, undefined].includes(data.suggestedAction as string | null | undefined)
  ) {
    throw new Error("Invalid response shape from server");
  }
  return {
    response: data as PetResponse,
    source: res.headers.get("X-TAMA-Source") === "gemini" ? "gemini" : "fallback",
  };
}

export async function generatePetReply(request: PetRequest): Promise<PetReplyResult> {
  try {
    return await fetchFromServer(request);
  } catch (err) {
    console.warn("[TAMA] LLM unavailable, using local fallback:", err);
    return { response: localFallbackReply(request), source: "fallback" };
  }
}

export { localFallbackReply };
