import type { SpeciesId } from "../art/pets";
import { BigLogo } from "./Brand";
import { SceneWall, ShellCluster } from "./Showcase";

type Props = {
  hatched: boolean;
  petName: string;
  species: SpeciesId;
  onPlay: () => void;
  onHow: () => void;
};

/** The intro page: what the project is, the pets, and how it learns. The actual pet lives on the My Pet page. */
export function HomePage({ hatched, petName, species: _species, onPlay, onHow }: Props) {
  return (
    <>
      <section className="hero scene-hero">
        <SceneWall />
        <div className="wrap hero-grid">
          <div className="hero-copy intro hero-panel">
            <BigLogo />
<h1>
              A pocket pet,
              <br />
              <span className="accent">rebuilt</span> for 2026.
            </h1>
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

          <ShellCluster onClick={onPlay} />
        </div>
      </section>
    </>
  );
}
