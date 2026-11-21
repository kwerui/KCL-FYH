# TAMA: Made by You

A 1990s virtual pet rebuilt for 2026. Hatch a pixel pet, look after it, talk to it, and watch it learn your habits and grow into a Scholar, a Chaos Sprite or a Buddy.

KCL FirstYearHack 2026, Retro Remix track.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

`npm run dev` starts the site and the optional chat server together. Without an API key the pet still works: chat falls back to local replies.

To use Gemini, copy `.env.example` to `.env` and add `GEMINI_API_KEY`. The optional `GEMINI_MODEL` defaults to `gemini-3.1-flash-lite`, the verified low-latency chat model. The key is read only by the Express server and is never sent to the browser. Never commit `.env`.

Other commands:

```bash
npm run dev:frontend   # site only
npm run build          # type check + production build
npm run preview        # serve the production build
npm run lint
```

## Pages

The site has two pages (hash routes, no extra router):

- **Home (`#/`):** the project intro. Hero with the pets bouncing around a showcase shell, the nine pets, and how it learns.
- **My Pet (`#/play`):** the actual game.
  - The interactive Tamagotchi. Tap the pet to pat it. Shell buttons work like the original: **A** moves between icons, **B** selects, **C** goes back (or pats). Keys A, B and C do the same.
  - Bezel icons: Feed, Play, Lights (sleep), Study, Talk, Stats, Mode and Attention. Attention flashes when the pet has a suggestion for you.
  - Hatch card (name + pick your pet), then the status card: needs, traits and what the brain has learned.
  - Chat with four modes, each with its own activity (Silly: jokes and a guessing game. Serious: task breaker. Study: focus timer and quiz. Companion: remembers only what you choose).
  - Brain card: live Q-values, explore rate, rewards and a demo speed toggle.
  - Evolution card with +15 demo buttons for judging.
  - Shell picker: 23 colours and patterns from the Figma file.

## Local memory

The pet runs entirely in the browser. Everything is saved in localStorage: `tama_pet` (name, species, needs, traits, form, remembered facts), `tama_rl` (the Q-table, visit counts, explore rate, rewards) and `tama_skin`. No account and no database. Only the optional Gemini chat talks to the server, and it falls back to local replies when Gemini is unavailable, times out, rejects a key, rate-limits, or cannot serve the configured model. The chat card safely shows whether the latest model reply came from Gemini or the local fallback. "Reset (new egg)" clears the pet and its brain.

## How the RL works

`src/game/rl.ts`

- The pet regularly suggests one thing: feed, play, rest or chat.
- It's a **contextual bandit** (one-step Q-learning, gamma = 0). The context is time of day (4) x hungry x tired x sad, so 32 situations.
- **Rewards:** you do what it suggested within the window: **+1**. You do something else: **-0.25**. You ignore it until the window closes: **-0.5**.
- **Update:** `Q(s,a) += alpha * (r - Q(s,a))` with alpha 0.25.
- **Policy:** epsilon-greedy. Epsilon starts at 35% and decays to 5% as it learns.
- **Learning by watching:** if you care for it while no suggestion is pending, that action gets a small habit reward (+0.4 at a lower learning rate) in the current situation.
- Normal timing: a suggestion every 45s with a 30s window. Demo speed: every 12s with a 15s window. "Make a suggestion now" triggers one instantly.
- The RL only chooses suggestions. Care stats and evolution are owned by the game logic, not the model.

## Evolution

`src/game/evolutionLogic.ts`

- Feeding, pats and Companion chats raise Friendship. Play and Silly raise Playfulness. Study sessions, quizzes and Study chats raise Curiosity.
- When the top trait reaches 30 the hatchling evolves: Curiosity becomes a Scholar, Playfulness a Chaos Sprite, Friendship a Buddy.
- After that it only changes form if another trait overtakes by 10, so it doesn't flicker.

## Project layout

```
src/
  art/            pixel grids (pets, accessories, logo) and shell skins
  components/     TamagotchiShell, LcdScene, PetSprite, ChatPanel, BrainCard, ...
  game/           petState, careLogic, evolutionLogic, rl, activities, dialogueFallback
  ai/             shared PetRequest / PetResponse contract and the client
  hooks/          useSpeech (voice in/out)
  styles/         retro.css
server/           optional LLM proxy (keeps the API key server-side)
```

