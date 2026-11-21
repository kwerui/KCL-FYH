/**
 * AI client — sends requests to our secure backend proxy, falls back to local dialogue.
 * Never exposes the API key: all LLM calls go through /api/chat on the server.
 */

import type { PetRequest, PetResponse } from "./types";
import { localFallbackReply } from "../game/dialogueFallback";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function fetchFromServer(request: PetRequest): Promise<PetResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(8000), // 8s timeout
  });

  if (!res.ok) throw new Error(`Server error: ${res.status}`);

  const data = await res.json();
  // Validate shape
  if (typeof data.reply !== "string" || typeof data.emotion !== "string") {
    throw new Error("Invalid response shape from server");
  }
  return data as PetResponse;
}

export async function generatePetReply(request: PetRequest): Promise<PetResponse> {
  try {
    return await fetchFromServer(request);
  } catch (err) {
    console.warn("[TAMA] LLM unavailable, using local fallback:", err);
    return localFallbackReply(request);
  }
}

export { localFallbackReply };
