import { ALL_SPECIES, type SpeciesId } from "../art/pets";
import { SKINS } from "../art/skins";
import { PetSprite } from "./PetSprite";
import { ShellArt } from "./ShellArt";

export function ShellGallery({ current, onPick }: { current: string; onPick: (id: string) => void }) {
  return (
    <div className="shell-grid">
      {SKINS.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`shell-tile ${current === s.id ? "active" : ""}`}
          onClick={() => onPick(s.id)}
          aria-pressed={current === s.id}
        >
          <ShellArt skin={s} withFace />
          <span>{s.name}</span>
          {current === s.id && <em className="pill pixel">ON</em>}
        </button>
      ))}
    </div>
  );
}

export function PetGallery({ yours, hatched }: { yours: SpeciesId; hatched: boolean }) {
  return (
    <div className="pet-grid">
      {ALL_SPECIES.map((s, i) => {
        const mine = hatched && s.id === yours;
        return (
          <article key={s.id} className={`pet-tile ${mine ? "mine" : ""}`} style={{ ["--accent" as string]: s.accent }}>
            <div className="pet-tile-art" style={{ animationDelay: `${i * 0.13}s` }}>
              <PetSprite species={s.id} evolution="buddy" plain className="fill" />
            </div>
            <h4>{s.name}</h4>
            <p className="muted small">{s.blurb}</p>
            {mine && <span className="pill pixel">YOUR PET</span>}
          </article>
        );
      })}
    </div>
  );
}

export function HowItWorks() {
  return (
    <div className="how-grid">
      <article className="card how-card">
        <span className="step pixel">01</span>
        <h3>Care</h3>
        <p>Feed, play, rest and pat. Hunger, energy and happiness drift over time, and nobody dies: it just gets grumpy.</p>
      </article>
      <article className="card how-card">
        <span className="step pixel">02</span>
        <h3>It learns you</h3>
        <p>
          A Q-learning brain watches what you do in each situation (time of day, hungry, tired, sad) and learns to suggest
          it. Follow a suggestion and it gets rewarded; ignore it and it learns that too.
        </p>
      </article>
      <article className="card how-card">
        <span className="step pixel">03</span>
        <h3>It grows</h3>
        <p>
          Every activity feeds Curiosity, Playfulness or Friendship. The leading trait evolves it into a Scholar, a Chaos
          Sprite or a Buddy, and changes how it talks.
        </p>
      </article>
      <article className="card how-card">
        <span className="step pixel">04</span>
        <h3>It talks back</h3>
        <p>
          Four modes with their own activity: Silly (jokes, guessing game), Serious (task breaker), Study (focus timer,
          quiz) and Companion (remembers what you choose). Works offline with local replies, smarter with an LLM.
        </p>
      </article>
    </div>
  );
}
