# TAMA: Made by You — AI Tamagotchi for 2026

> **Status:** Current working concept; agree final scope and name with the team before implementation.
> **Event:** KCL FirstYearHack 2026 · **Track:** Retro Remix — Old Tech, New Tricks
> **Repository:** `kwerui/KCL-FYH`
> **Deadline:** Draft submission by **17:30**; hard submission by **18:00**, 21 November 2026.
> **Project rule:** All project work happens during the hackathon, and **JetBrains Air usage is mandatory**.

## 1. Elevator pitch

**What if a Tamagotchi could talk back — and grow into a different companion depending on how you raise it?**

**TAMA: Made by You** reimagines the 1990s virtual pet for 2026. Feed and play with a cute pixel creature, talk to it by voice or text, choose from distinct conversation modes (Silly, Serious, Study and Companion), and influence its developing personality. It remembers selected interactions and evolves in both appearance and behaviour. Unlike a generic chatbot with a mascot, **the creature's needs, activities, memory and personality all affect how it responds**.

### Core design principle
**The original Tamagotchi needed you to care for it; our Tamagotchi grows with you.**

### One-line judge hook
**"We didn't just give Tamagotchi a chatbot. We gave it a personality that you shape through how you care, play and learn together."**

## 2. What the player sees and does

1. **Hatch:** Enter a name and hatch a small animated pixel pet. Show a short introduction.
2. **Care:** Feed, play with or let the pet rest; display a few simple needs (e.g. hunger, energy, happiness).
3. **Talk:** Type a message or tap a microphone button to speak; pet replies in a speech bubble and can speak the answer aloud.
4. **Switch mode:** Select **Silly**, **Serious**, **Study** or **Companion**. Each changes both the conversational style **and an interactive feature**.
5. **Grow:** Completing activities influences trait scores (**curiosity**, **playfulness**, **friendship**) and unlocks a visibly distinct evolution.
6. **Return:** Reload the page and see saved name, selected mode, trait scores, and optionally a few user-approved memory facts.

**Success state / showcase:** During a 2-minute demo, the pet responds to a spoken or typed prompt, changes mode, completes a mini study/game action and visibly evolves into a different personality. No account or installation required for judges.

## 3. Modes (features, not just prompt presets)

| Mode | Personality in conversation | One working user interaction | What evolves |
|---|---|---|---|
| **Silly** | Playful, absurd, energetic | Tell a joke or launch a tiny guessing mini-game | +Playfulness |
| **Serious** | Calm, concise, practical | Help break a user-entered task into 2–3 steps | +Discipline (optional; don't add a fourth trait unless easy) |
| **Study** | Curious, encouraging, focused | Start a short focus timer and/or ask a simple revision question | +Curiosity |
| **Companion** | Warm and conversational | Chat, pet/care action, remember a fact only with consent | +Friendship |

**Important:** A different mode should be demonstrably different even if no external LLM API is connected. Use reliable local responses as a fallback.

## 4. Tamagotchi mechanics and personality

### Core needs
- **Hunger** (feed action raises it to a healthier level).
- **Energy** (rest action restores it; playing may use energy).
- **Happiness** (play and positive interaction raise it).

Choose simple, understandable numbers (e.g. 0–100). Avoid a pet-death mechanic in the hackathon MVP: the experience should feel welcoming and be easy to demonstrate. Do not rely on many hours of real time for evolution.

### Personality evolution — our signature feature
- Track three simple scores: **Curiosity**, **Playfulness**, **Friendship**.
- Meaningful actions increase one or more scores (e.g. finishing a focus session → curiosity; playing → playfulness; chatting/caring → friendship).
- Visual evolution is **deterministic**, triggered after a small demo-friendly threshold. For example:
  - **Scholar**: glasses / book accessory / thoughtful animation when curiosity leads.
  - **Chaos Sprite**: playful expression / bright accessory when playfulness leads.
  - **Buddy**: heart accessory / affectionate expression when friendship leads.
- The active evolution influences future greetings and dialogue, not just the sprite.
- Expose progress clearly with simple meters and an **Evolution** or **Personality** panel.
- **Demo reset button:** For judging, allow a fresh hatch or a demo evolution; do not force 30 minutes of repetitive activity.

### Memory (small and controlled)
- Store pet name, care stats, mode and evolution scores locally.
- Optionally let players explicitly save a short fact such as "I am studying Python" and show it recalled later.
- Provide a **Forget / Reset** control. Do not store voice recordings.
- Avoid pretending that the pet understands deeply when using scripted responses.

## 5. Voice and conversation implementation

### Minimum viable voice
- **Speech input:** browser speech recognition when supported, with a visible **type-to-chat fallback**.
- **Speech output:** browser `speechSynthesis` to speak the pet's text; include **mute** and avoid auto-playing audio before the user interacts.
- Show transcription in the chat box before sending; handle microphone permissions and unsupported browsers gracefully.

### Conversation engine — AI teammate owns this

**Preferred path:** Use a pre-trained model or hosted LLM API with **custom mode/personality instructions**, a small structured memory context and an endpoint that adheres to the shared interface below. This gives the creature genuinely useful conversation and is a better seven-hour priority than trying to train an LLM from scratch.

**Reliability path:** Ship a local scripted/rule-based responder for each mode; the app must still be playable if the model, internet, microphone or API credits fail.

**"LLM training" workstream (time-boxed):**
1. Pick a model/provider with an accessible API or runnable local inference **first**.
2. Make the end-to-end request return a response matching the agreed TypeScript types.
3. Write a tiny curated set of sample prompts for Silly, Serious, Study and Companion; test personality consistency, output length, safety and response latency.
4. Iterate prompts using these evaluations; this is **prompt engineering and evaluation, not model training**.
5. **Optional stretch:** Try LoRA/fine-tuning on an existing small model if the working API and full MVP are already stable, and there is enough hardware, dataset and time. Avoid training from scratch.

Personality evolution scores and opt-in memories come from application state; **training or prompting alone does not create persistent memory**.

Keep API credentials server-side (e.g. a lightweight Node endpoint or serverless function) with safe environment variables. Do not expose a paid API key in React/Vite code or GitHub. Text chat and pet-care interactions must still function when AI is unavailable.

## 6. MVP vs optional

### Must have for an actual playable demo
- [ ] Cute, recognisable retro pixel-art Tamagotchi interface, with at least idle + happy/sad expressions.
- [ ] Pet naming / hatch screen.
- [ ] Care actions: **Feed**, **Play**, **Rest**, with visibly changing stats.
- [ ] Four selectable modes with visibly different response styles.
- [ ] At least **one working interactive feature** beyond basic chat (study timer or silly mini-game).
- [ ] Text chat with reliable responses; speech bubbles.
- [ ] Voice output via speech synthesis and microphone input **where supported**, with fallbacks.
- [ ] Personality trait meters and at least **two visible evolutions** based on actions.
- [ ] Reload preserves core stats/evolution (localStorage).
- [ ] Clear reset/replay flow and no dead-end screens.
- [ ] Pass local build; keep app responsive for a laptop judging demo.

### Add only if ahead of schedule
- More mini-games and study activities.
- Live LLM conversation through a secure backend (the AI teammate should aim to make this work early, but **it must not block the MVP**).
- Optional user-approved remembered facts from conversation.
- Sound effects, hatching animations and 3+ unique evolution sprites.
- Lightweight LoRA fine-tuning **only after** a working AI API and reliable full-game demo.
- Multiple creatures, clothing/accessories, badges or streaks.
- Progressive offline capabilities.

### Do *not* spend early time on
Accounts, multiplayer, vector databases, long-term cloud memory, custom voice model training, elaborate backend, or complex hardware.

## 7. Suggested architecture

**Primary stack:** React + Vite + TypeScript + CSS. The main pet app is frontend-first and locally runnable. An LLM provider, if integrated, uses a **separate secure API/serverless endpoint**; never directly embed a secret key in the browser.

```text
src/
  components/
    TamagotchiShell.tsx        # pixel device frame and screen
    PetSprite.tsx              # creature expressions, animations, evolution
    CareControls.tsx           # feed, play, rest
    ModeSelector.tsx
    ChatPanel.tsx
    VoiceControls.tsx
    StatusMeters.tsx
  game/
    petState.ts                # shared types, initial state and persistence
    careLogic.ts               # deterministic care actions
    evolutionLogic.ts          # trait scores, forms
    activities.ts              # timer or simple mini-game
    dialogueFallback.ts        # offline mode-specific replies
  ai/
    types.ts                   # the shared PetRequest / PetResponse contract
    client.ts                  # sends requests to secure endpoint, falls back locally
  hooks/
    useSpeech.ts               # microphone and speech synthesis + fallbacks
  styles/
    retro.css
server/                         # OPTIONAL if hosted AI model is used
  ...                           # endpoint and provider integration; server-side secrets
```

**Suggested state fields:** `petName`, `hunger`, `energy`, `happiness`, `mode`, `curiosity`, `playfulness`, `friendship`, `evolution`, `savedFacts`.

**Integration principle:** Separate UI from game logic and AI. React should not depend on a particular model/provider. The voice system converts input to text, hands it to conversation flow, then speaks the returned reply. The AI response cannot directly mutate care/evolution stats: game logic owns those actions.

## 8. Three-person responsibility split — agreed direction

Three clear workstreams; one teammate explicitly owns the LLM experimentation. **Owners' names and assignments are to be confirmed**, except that the teammate interested in LLM training will take the AI role.

| Person | Role | Responsibilities | Concrete deliverable | Suggested branch |
|---|---|---|---|---|
| **1 — AI / LLM Engineer** (teammate who wants model training) | Conversation intelligence | Choose existing model/API, design prompts for four modes, build/test dialogue evaluation set, create secure inference endpoint or adapter, compare responses; optional small-model LoRA only if time remains | A `generatePetReply(request)` service returning a typed answer; reliable provider/fallback handoff | `feature/llm` |
| **2 — Pet Frontend Engineer** (suggested: project owner) | Experience & visual design | Pixel Tamagotchi shell/sprites, animations, mode selector, chat UI, care buttons, status meters, evolution visuals, responsive polish | Playable UI using mock data while API/game logic are developed | `feature/frontend` |
| **3 — Voice & Game Systems Engineer** (remaining teammate) | Behaviour & integration | Speech-to-text, text-to-speech, shared pet state, feeding/play/rest, trait evolution, localStorage, one mode-specific activity, integration of AI response into UI | Functional voice/text → response → pet reaction flow, care/evolution/persistence, tests | `feature/game-voice` |

**Merge strategy:** All three branch from `main`; avoid editing the same central files simultaneously. Person 3 coordinates integration of game state and AI service with the frontend; Person 2 does final UI integration/polish. Open small pull requests and integrate an early mocked end-to-end flow before extending features. Nobody waits for LLM training to finish.

### Shared AI interface (agree on this before writing parallel features)

```ts
export type PetMode = "silly" | "serious" | "study" | "companion";

export type PetRequest = {
  message: string;
  mode: PetMode;
  petName: string;
  personality: {
    curiosity: number;
    playfulness: number;
    friendship: number;
  };
  memories: string[]; // only user-approved facts
};

export type PetResponse = {
  reply: string;
  emotion: "happy" | "sad" | "excited" | "thinking";
};

// Returns the same shape whether using an LLM or a local fallback.
export async function generatePetReply(request: PetRequest): Promise<PetResponse>;
```

**First integration test:** UI sends `{ message: "Can we study Python?", mode: "study", ... }` → AI/fallback returns `{ reply: "...", emotion: "excited" }` → UI shows speech bubble and animates expression → optional browser TTS reads reply. No database, accounts, or fine-tuning should be needed for this test.

### Definition of done by role
- **AI engineer:** demo each of four modes returning distinct answers; provider errors fall back cleanly; no leaked secrets.
- **Frontend engineer:** can hatch, see/care for pet, change modes, read conversation, observe at least two expressive/evolved visuals; mobile/laptop reasonable.
- **Voice/game engineer:** can type/speak where supported, hear a reply, increase stats, persist and reload state, trigger evolution; mic permission refusal doesn't break game.

## 9. One-day timeline

| Time | Checkpoint |
|---|---|
| **11:00–11:30** | Agree roles, API contract, art direction, one activity and branch ownership; start real JetBrains Air sessions |
| **11:30–13:00** | Parallel: frontend pet shell; voice/game state & fallback; AI teammate selects model and proves first response |
| **13:00–14:30** | First integration: mode-aware text response displayed in UI, care stats working, speech synthesis and mic fallback |
| **14:30–15:30** | Personality evolution + localStorage + one activity; improve distinct AI modes and voice handling |
| **15:30–16:30** | Full end-to-end demo; stop speculative training if anything critical is incomplete |
| **16:30–17:30** | Test mic/no-mic, offline/API-failure flows, polish, README, judge demo rehearsal, submission draft |
| **17:30–18:00** | Smoke test and submit **before 18:00** |

**If behind:** Preserve hatch → care → switch mode → talk (local fallback acceptable) → evolve. Cut fine-tuning, extra activities, multiple animations, elaborate memory and advanced AI first.

## 10. Snowflake prize — decision

**Default: do not add Snowflake.** A virtual pet with local memory and lightweight care state does not need a cloud analytics warehouse. Snowflake only becomes worthwhile if we add a substantial consented analytics/research feature with an explanatory demo (not just saving a score). Do not risk a finished Retro Remix entry for an artificial sponsor integration.

## 11. JetBrains Air requirement and session proof (mandatory)

The event requires participants to **build using JetBrains Air**. Installing IntelliJ and configuring Codex alone is not enough. Each participant should perform meaningful development via **IntelliJ → Agent Sessions → Codex (through Air)** and retain proof.

**After every substantive Air/Codex task:**
1. Let the agent finish; inspect its changes, run the app and tests.
2. In **Agent Sessions**, find the session (optionally pin it).
3. Right-click → **Copy Session Info → Session ID**; save the ID in a private note.
4. Right-click again → **Copy Session Info → Session Log**; paste the `.airsession` file into a **private folder outside GitHub**.
5. Confirm the log file exists; keep the original session until the hackathon results are announced.
6. Commit and push reviewed changes; never commit credentials, recordings or session logs.

**Note:** Editing this document directly through GitHub does **not** count as an Air agent development session.

## 12. Decisions to finalise together
- [ ] Product name: **TAMA: Made by You** or another name?
- [ ] Which art direction: handheld LCD green retro device, colourful pixel Tamagotchi, or custom original shell?
- [ ] Which one activity is guaranteed for judging: Study timer, Silly mini-game or both?
- [ ] Is an external AI model feasible with the team's accounts, credentials and time? If not, use local mode-specific dialogue.
- [ ] What action threshold triggers the first evolution? Make it achievable during the judge demo.
- [ ] Confirm Person 1 (LLM), Person 2 (frontend) and Person 3 (voice/game) owners; decide who handles final merges.
- [ ] Agree and share the PetRequest/PetResponse contract before parallel work.
- [ ] Select an accessible LLM provider, with a local scripted fallback; decide whether fine-tuning is realistic.

## 13. Two-minute judging demo

1. **0:00–0:20:** Hatch and name a creature. “A 1990s virtual pet, rebuilt for 2026.”
2. **0:20–0:45:** Feed/play; show care stats and expressive reaction.
3. **0:45–1:10:** Speak or type a question; hear/read the pet's answer.
4. **1:10–1:30:** Switch from Silly to Study; demonstrate a concrete activity.
5. **1:30–1:50:** Increase curiosity and visibly evolve into the Scholar form; show the personality change.
6. **1:50–2:00:** Refresh and show the pet remembers its progress. “You raise it through the way you interact.”

---
*This is the team's living project brief. Keep the focus on a polished, interactive and memorable prototype rather than a checklist of disconnected AI features.*
