/**
 * Secure Gemini proxy — API key lives here only, never in browser code.
 * POST /api/chat → returns PetResponse JSON plus a safe source marker.
 */

import "dotenv/config";
import cors from "cors";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { randomUUID } from "node:crypto";
import { buildSystemPrompt } from "../src/ai/prompts.js";
import type { PetRequest } from "../src/ai/types.js";
import {
  GEMINI_MAX_OUTPUT_TOKENS,
  GEMINI_THINKING_LEVEL,
  GEMINI_TIMEOUT_MS,
  validatePetRequest,
} from "./chat.js";
import { fallbackPetResponse, parseGeminiPetResponse, petResponseJsonSchema } from "./gemini.js";

const app = express();
const PORT = process.env.PORT ?? 3001;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({ origin: allowedOrigins, exposedHeaders: ["X-TAMA-Source", "X-Request-Id"] }));
app.use(express.json({ limit: "16kb" }));

function errorStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null || !("status" in error)) return null;
  return typeof error.status === "number" ? error.status : null;
}

function diagnostic(event: string, fields: Record<string, string | number | null>) {
  // Deliberately allowlist operational fields: no request text, provider payload, or API key.
  console.warn(JSON.stringify({ event, provider: "gemini", ...fields }));
}

function providerErrorReason(error: unknown, status: number | null): "timeout" | "api_error" {
  const name = error instanceof Error ? error.name : "";
  return name === "TimeoutError" || name === "AbortError" || status === 408 || status === 504 ? "timeout" : "api_error";
}

async function requestGemini(body: PetRequest, requestId: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    diagnostic("gemini_fallback", { requestId, reason: "missing_api_key", model: GEMINI_MODEL, durationMs: 0, providerStatus: null });
    return null;
  }

  const systemInstruction = buildSystemPrompt(
    body.mode ?? "companion",
    body.petName ?? "Tama",
    body.personality ?? { curiosity: 50, playfulness: 50, friendship: 50 },
    body.hunger ?? 50,
    body.energy ?? 80,
    body.happiness ?? 70,
    body.memories ?? [],
  );

  const startedAt = performance.now();
  try {
    const gemini = new GoogleGenAI({ apiKey });
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: body.message,
      config: {
        systemInstruction,
        // Minimal thinking is sufficient for a short, conversational pet turn.
        thinkingConfig: { thinkingLevel: GEMINI_THINKING_LEVEL },
        maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
        responseMimeType: "application/json",
        responseJsonSchema: petResponseJsonSchema,
        abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      },
    });
    const parsed = response.text ? parseGeminiPetResponse(response.text) : null;
    if (!parsed) {
      diagnostic("gemini_fallback", {
        requestId,
        reason: response.text ? "schema_failure" : "empty_response",
        model: GEMINI_MODEL,
        durationMs: Math.round(performance.now() - startedAt),
        providerStatus: null,
      });
    }
    return parsed;
  } catch (error) {
    const status = errorStatus(error);
    diagnostic("gemini_fallback", {
      requestId,
      reason: providerErrorReason(error, status),
      model: GEMINI_MODEL,
      durationMs: Math.round(performance.now() - startedAt),
      providerStatus: status,
    });
    return null;
  }
}

app.post("/api/chat", async (req, res) => {
  const validated = validatePetRequest(req.body);
  if (!validated.ok) {
    res.status(400).json({ error: validated.error });
    return;
  }

  const requestId = randomUUID();
  res.set("X-Request-Id", requestId);
  const geminiResponse = await requestGemini(validated.value, requestId);
  res.set("X-TAMA-Source", geminiResponse ? "gemini" : "fallback").json(geminiResponse ?? fallbackPetResponse(validated.value));
});

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "Invalid JSON request body" });
    return;
  }
  next(error);
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[TAMA server] http://localhost:${PORT}`);
  console.log(`[TAMA server] Gemini API key ${process.env.GEMINI_API_KEY ? "LOADED ✓" : "MISSING — will use fallback"}`);
});
