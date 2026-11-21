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
