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

### Conversation engine
**Path A — safer for a short hackathon:** Local scripted/rule-based replies tailored to each mode, care state and evolution, with some variation and real interactivity.

**Path B — stretch if one teammate owns it:** Connect an LLM through a secure server-side endpoint with a mode-specific system instruction and small, permissioned memory context. Keep keys on the server only, rate-limit where possible, and retain Path A as the fallback.

**Never expose an API key inside browser JavaScript, the repo or the judging demo.** Text chat and all pet interactions should still work when the voice/LLM service fails.

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
- Fully integrated LLM conversation through a secure backend.
- User-approved remembered facts from conversation.
- Sound effects, hatching animations and 3+ unique evolution sprites.
- Multiple creatures, clothing/accessories, badges or streaks.
- Progressive offline capabilities.

### Do *not* spend early time on
Accounts, multiplayer, vector databases, long-term cloud memory, custom voice model training, elaborate backend, or complex hardware.

## 7. Suggested architecture

**Primary stack:** React + Vite + TypeScript + CSS. Keep the MVP frontend-first and locally runnable.

```text
src/
  components/
    TamagotchiShell.tsx        # pixel device frame and screen
    PetSprite.tsx             # creature expression, animations, evolution
    CareControls.tsx          # feed, play, rest
    ModeSelector.tsx
    ChatPanel.tsx
    VoiceControls.tsx
    StatusMeters.tsx
  game/
    petState.ts               # types, initial state and persistence
    careLogic.ts              # deterministic care actions
    evolutionLogic.ts         # trait scoring and forms
    dialogue.ts               # reliable mode-specific fallback
  hooks/
    useSpeech.ts              # recognition, synthesis + fallback
  styles/
    retro.css
```

**Suggested state fields:** `petName`, `hunger`, `energy`, `happiness`, `mode`, `curiosity`, `playfulness`, `friendship`, `evolution`, `savedFacts`.

**Implementation approach:** Separate game logic from UI. Mutate state through small actions; derive expressions/evolutions from state. Keep voice APIs optional, not on the critical rendering path. Do not let simultaneous changes create conflicting pet states.

## 8. Three-person responsibility split

| Owner | Main deliverable | Integration boundary |
|---|---|---|
| **A — Pet UI / frontend** | Pixel pet, responsive shell, status meters, care controls, animations | Imports shared pet-state types/actions |
| **B — Voice / chat / modes** | Microphone input, speech output, chat interface, distinct mode responses | Reads mode + pet traits, emits dialogue actions |
| **C — Evolution / persistence / activities** | Care and evolution logic, localStorage, focus timer or mini-game, testing | Exports shared state/actions and utility functions |

Agree on names/types and branch ownership before parallel implementation. Merge frequently, with a single person responsible for integration.

## 9. One-day timeline

| Time | Checkpoint |
|---|---|
| **11:00–11:30** | Finalise concept, freeze MVP and interfaces, start actual Air agent sessions |
| **11:30–13:00** | Build Tamagotchi screen + pet state + basic care interactions |
| **13:00–14:30** | Add text chat, mode responses, voice controls/fallback |
| **14:30–15:30** | Personality trait changes, evolution visuals and persistence |
| **15:30–16:30** | Finish one mode-specific activity; integrate and test on one machine |
| **16:30–17:30** | Test mic/no-mic flows, polish, README, rehearse demo, draft submission |
| **17:30–18:00** | Final smoke test and submit **before 18:00** |

**If running late:** Preserve hatch → care → switch mode → talk → evolve. Cut LLM, extra activities, multiple animations and advanced memory first.

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
- [ ] Confirm owner A/B/C and Git branch strategy.

## 13. Two-minute judging demo

1. **0:00–0:20:** Hatch and name a creature. “A 1990s virtual pet, rebuilt for 2026.”
2. **0:20–0:45:** Feed/play; show care stats and expressive reaction.
3. **0:45–1:10:** Speak or type a question; hear/read the pet's answer.
4. **1:10–1:30:** Switch from Silly to Study; demonstrate a concrete activity.
5. **1:30–1:50:** Increase curiosity and visibly evolve into the Scholar form; show the personality change.
6. **1:50–2:00:** Refresh and show the pet remembers its progress. “You raise it through the way you interact.”

---
*This is the team's living project brief. Keep the focus on a polished, interactive and memorable prototype rather than a checklist of disconnected AI features.*
