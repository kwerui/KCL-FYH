# Game state module

`petState.ts` is a pure TypeScript module. It has no React, voice, network, or
LLM imports, so the UI owns rendering and the conversation service cannot
silently change a pet's state.

## Frontend usage

```tsx
import { applyCareAction, loadPetState, savePetState } from "../game";

const [pet, setPet] = useState(loadPetState);

function care(action: "feed" | "play" | "rest") {
  setPet((current) => {
    const next = applyCareAction(current, action);
    savePetState(next);
    return next;
  });
}
```

Render `pet.hunger`, `pet.energy`, and `pet.happiness` as 0–100 meters.
`hunger` is intentionally a fullness meter: a higher value means the pet was
fed more recently. Use `pet.evolution` with `evolutionLabels` to choose the
sprite/accessory. `resetPetState()` provides the demo reset flow.

## LLM and activity usage

The LLM should receive `curiosity`, `playfulness`, and `friendship` as context
but must not mutate state. After a completed game activity, the UI/game flow
can explicitly call `recordPetInteraction(pet, "study")` or
`recordPetInteraction(pet, "chat")`, save the returned state, and re-render.

## Study Mode

`studyTimer.ts` is timestamp-based, not interval-count-based: render it with a
normal UI interval, but call `completeStudySession(timer, pet, Date.now())` on
each tick and when the browser becomes visible again. It catches up after an
inactive tab and returns both the next timer and pet state. Its `rewarded` flag
ensures `recordPetInteraction(pet, "study")` runs at most once per timer.

```ts
const result = completeStudySession(timer, pet, Date.now());
setTimer(result.timer);
setPet(result.petState);
savePetState(result.petState);

if (result.rewarded) {
  voice.speak(result.message);
}
```

Use `createStudyTimer()` for a 25-minute session or
`createStudyTimer({ durationMs: DEMO_STUDY_DURATION_MS })` for the 10-second
judge demo. `getStudyTimerMessage(timer)` supplies display/speech text for all
timer states.
