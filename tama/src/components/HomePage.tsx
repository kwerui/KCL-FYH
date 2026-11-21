import type { Skin } from "../art/skins";
import type { SpeciesId } from "../art/pets";
import { HowItWorks, PetGallery } from "./Galleries";
import { PetCrowd } from "./PetCrowd";
import { TamagotchiShell } from "./TamagotchiShell";

type Props = {
  skin: Skin;
  hatched: boolean;
  petName: string;
  species: SpeciesId;
  onPlay: () => void;
  onHow: () => void;
};

/** The intro page: what the project is, the pets, and how it learns. The actual pet lives on the My Pet page. */
export function HomePage({ skin, hatched, petName, species, onPlay, onHow }: Props) {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy intro">
            <span className="badge pixel">KCL FIRSTYEARHACK 2026 / RETRO REMIX</span>
            <h1>
              A pocket pet,
              <br />
              <span className="accent">rebuilt</span> for 2026.
            </h1>
            <p className="lead">
              The 1990s virtual pet needed you to look after it. Ours grows with you. It learns your habits with
              reinforcement learning, talks back in four modes, remembers only what you choose, and evolves into a
              Scholar, a Chaos Sprite or a Buddy depending on how you raise it.
            </p>
            <div className="cta-row">
              <button type="button" className="btn btn-primary" onClick={onPlay}>
                {hatched ? `Visit ${petName}` : "Hatch your pet"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onHow}>
                How it learns
              </button>
            </div>
            <ul className="hero-points">
              <li><b>Learns you.</b> A Q-learning brain picks up your routine and starts suggesting it.</li>
              <li><b>Grows.</b> Care, play and study shape its personality and its form.</li>
              <li><b>Yours.</b> Nine original pixel pets and 23 shells to choose from.</li>
            </ul>
          </div>

          <div className="hero-device showcase">
            <TamagotchiShell
              skin={skin}
              selected={-1}
              attention={false}
              onIcon={onPlay}
              onButton={onPlay}
            >
              <div className="lcd-scene">
                <div className="lcd-grid" />
                <PetCrowd onClick={onPlay} label="Go to My Pet" />
                <div className="lcd-hint bottom">press any button</div>
              </div>
            </TamagotchiShell>
          </div>
        </div>
      </section>

      <section className="section" id="pets">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow pixel">PETS</span>
            <h2>Who's in the egg?</h2>
            <p className="muted">Nine original pixel pets. Each one can grow into all three forms.</p>
          </div>
          <PetGallery yours={species} hatched={hatched} />
          <div className="center-cta">
            <button type="button" className="btn btn-primary" onClick={onPlay}>
              {hatched ? `Visit ${petName}` : "Pick yours and hatch it"}
            </button>
          </div>
        </div>
      </section>

      <section className="section tint" id="how">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow pixel">HOW IT LEARNS</span>
            <h2>The original needed you. This one grows with you.</h2>
          </div>
          <HowItWorks />
        </div>
      </section>
    </>
  );
}
