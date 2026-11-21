import { FORM_INFO, EVOLUTION_THRESHOLD, leadingTrait, type Evolution, type Trait } from "../game/evolutionLogic";
import type { PetState } from "../game/petState";
import { PetSprite } from "./PetSprite";

const FORMS: { form: Evolution; trait: Trait; label: string }[] = [
  { form: "scholar", trait: "curiosity", label: "Curiosity" },
  { form: "chaos_sprite", trait: "playfulness", label: "Playfulness" },
  { form: "buddy", trait: "friendship", label: "Friendship" },
];

export function EvolutionCard({ pet, onBoost }: { pet: PetState; onBoost: (t: Trait) => void }) {
  const lead = leadingTrait(pet);
  return (
    <section className="card evo-card" aria-label="Personality and evolution">
      <div className="card-head">
        <h3>Who will it become?</h3>
        <span className="pill pixel">{FORM_INFO[pet.evolution].name.toUpperCase()}</span>
      </div>
      <p className="muted">
        The leading trait decides the form once it passes {EVOLUTION_THRESHOLD}. Study raises Curiosity, play raises
        Playfulness, chats and pats raise Friendship.
      </p>
      <div className="forms">
        {FORMS.map((f) => (
          <div key={f.form} className={`form-tile ${pet.evolution === f.form ? "current" : ""} ${lead === f.trait && pet.hatched ? "leading" : ""}`}>
            <div className="form-art">
              <PetSprite species={pet.species} evolution={f.form} blink={false} className="fill" />
            </div>
            <b>{FORM_INFO[f.form].name}</b>
            <span className="muted small">{f.label} {Math.round(pet[f.trait])}</span>
            <button type="button" className="chip" onClick={() => onBoost(f.trait)} disabled={!pet.hatched} title="Demo shortcut">
              +15 demo
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
