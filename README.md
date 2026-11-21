# TAMA: Made by You

**A 1990s Tamagotchi reimagined with conversational AI and reinforcement learning.**

Built for **KCL FirstYearHack 2026** — **Retro Remix**.

TAMA lets players hatch and care for one of nine original pixel pets, customise its shell, and develop its personality through play. Chat in four modes—Silly, Serious, Study, and Companion—and, where the browser supports it, talk with voice input and hear speech output.

## What makes it different

Gemini powers conversational pet replies when a key is configured. Separately, a small contextual-bandit Q-learning system learns which care activity to suggest from the player's behaviour. It does not control pet needs, care, or evolution; it only chooses between suggestions to feed, play, rest, or chat.

The learner represents 32 contexts: four times of day combined with whether the pet is hungry, tired, and sad. For each context it scores four actions. Following a suggestion earns **+1**; doing another activity earns **−0.25**; letting it expire earns **−0.5**. After each suggestion, it updates that action's value and uses epsilon-greedy selection: it usually chooses its best current suggestion, but occasionally explores another action. Exploration starts at 35% and decays to a 5% minimum.

## Tech stack

React, TypeScript, Vite, Express, Google Gemini API, and the browser Web Speech API.

## Run locally

```bash
cd tama
npm install
cp .env.example .env
# Optional: add GEMINI_API_KEY to .env
npm run dev
```

Open <http://localhost:5173>.

The Express chat server is started alongside Vite. Core pet interactions, including chat, work without a Gemini key through local fallback responses.

## Testing

From `tama/`:

```bash
npm test
npm run build
```

## Project structure

```text
tama/                 TAMA application
  src/                React interface, pet game logic, Q-learning, and AI client
  server/             Express Gemini proxy and fallback response handling
  .env.example        Optional Gemini configuration
src/voice/            Separate shared browser voice module and root playground
```

The repository root also contains a standalone voice-testing playground with its own package configuration. It is separate from the TAMA application; TAMA imports the shared voice module from `src/voice/`.
