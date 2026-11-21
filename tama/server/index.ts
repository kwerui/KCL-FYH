/**
 * Secure backend proxy — API key lives here only, never in browser code.
 * POST /api/chat  → calls Claude → returns PetResponse JSON
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "../src/ai/prompts.js";
import type { PetRequest, PetResponse } from "../src/ai/types.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "16kb" }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/chat", async (req, res) => {
  const body = req.body as PetRequest;

  if (!body?.message || typeof body.message !== "string") {
    res.status(400).json({ error: "Missing message" });
    return;
  }
  if (body.message.length > 500) {
    res.status(400).json({ error: "Message too long" });
    return;
  }

  const systemPrompt = buildSystemPrompt(
    body.mode ?? "companion",
    body.petName ?? "Tama",
    body.personality ?? { curiosity: 50, playfulness: 50, friendship: 50 },
    body.hunger ?? 50,
    body.energy ?? 80,
    body.happiness ?? 70,
    body.memories ?? []
  );

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: "user", content: body.message }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    let parsed: Partial<PetResponse>;
    try {
      const clean = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { reply: rawText.slice(0, 300) || "...", emotion: "happy", suggestedAction: null };
    }

    const validEmotions = ["happy", "sad", "excited", "thinking", "sleepy", "hungry"];
    const validActions = ["feed", "play", "rest", null];
    const response: PetResponse = {
      reply: typeof parsed.reply === "string" ? parsed.reply.slice(0, 400) : "...",
      emotion: validEmotions.includes(parsed.emotion as string)
        ? (parsed.emotion as PetResponse["emotion"])
        : "happy",
      suggestedAction: validActions.includes(parsed.suggestedAction as string | null)
        ? parsed.suggestedAction
        : null,
    };

    res.json(response);
  } catch (err) {
    console.error("[server] Anthropic error:", err);
    res.status(502).json({ error: "LLM unavailable" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[TAMA server] http://localhost:${PORT}`);
  console.log(`[TAMA server] API key ${process.env.ANTHROPIC_API_KEY ? "LOADED ✓" : "MISSING — will use fallback"}`);
});
