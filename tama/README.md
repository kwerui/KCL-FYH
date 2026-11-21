# TAMA: Made by You

A 1990s Tamagotchi reimagined with conversational AI and reinforcement learning. Built for KCL FirstYearHack 2026, Retro Remix.

Hatch one of nine pixel pets, care for it, customise the shell, chat in four modes, and use supported browser voice input and speech output. Core pet interactions and chat remain available through local fallback responses when no Gemini API key is configured.

## Run locally

```bash
npm install
cp .env.example .env
# Optional: add GEMINI_API_KEY to .env
npm run dev
```

Open <http://localhost:5173>. `npm run dev` starts Vite and the local Express chat server. The API key is read by the server, not the browser.

## Commands

```bash
npm test
npm run build
npm run lint
npm run dev:frontend
npm run dev:server
```

## Navigation and features

The application uses hash routes with no router dependency:

- **Home (`#/`)** introduces TAMA and links into the game.
- **About (`#/about`)** shows the pet gallery, shell gallery, and an interactive learning explainer.
- **My Pet (`#/play`)** is the game: hatch and care for a pet, switch its conversation mode, use its device controls, and view its learning state.

Conversation modes are **Silly** (jokes and a guessing game), **Serious** (task breakdown), **Study** (focus timer and quiz), and **Companion** (opt-in saved facts). The device supports feed, play, rest, study, chat, stats, shell, and attention controls. Voice input and output use the browser's Web Speech API when supported; typing remains available when voice input is unavailable.

## Contextual-bandit Q-learning

`src/game/rl.ts` runs a one-step contextual bandit (Q-learning with gamma 0) to choose a suggestion, not to run the pet simulation. It observes 32 contexts: four times of day × hungry/not hungry × tired/not tired × sad/not sad. In each context it scores four actions: feed, play, rest, and chat.

- Follow a pending suggestion: **+1**
- Do another activity while a suggestion is pending: **−0.25**
- Let a suggestion expire: **−0.5**

Each outcome updates the suggested action's value with `Q(s,a) ← Q(s,a) + α(reward − Q(s,a))`, where `α = 0.25`. Epsilon-greedy selection starts with 35% exploration and decays to a 5% minimum. Care performed with no pending suggestion receives a smaller habit observation. The game logic, rather than the learner, owns needs and evolution.

## Evolution

The leading personality trait determines the evolved form: Curiosity → Scholar, Playfulness → Chaos Sprite, and Friendship → Buddy. A hatchling can evolve once it is at least 24 hours old (one minute in demo mode) and its leading trait reaches **25**. After evolving, a form can switch only after 24 hours (30 seconds in demo mode), when a different leading trait is at least 10 points ahead.

## Project layout

```text
src/
  ai/             Gemini client, prompts, and response types
  art/            pixel pets, scenes, and shell skins
  components/     pages, Tamagotchi controls, activities, and panels
  game/           care, evolution, activities, habits, and Q-learning
server/           Express Gemini proxy and fallback handling
../src/voice/     shared browser voice hook and voice preferences
```

`../src/voice/` is shared with the repository's separate root voice-testing playground. It is not a `tama/src/hooks` module; TAMA imports it directly from the root voice module.
