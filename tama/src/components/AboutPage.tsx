import type { SpeciesId } from "../art/pets";
import { HowItWorks, PetGallery } from "./Galleries";

type Props = {
  hatched: boolean;
  petName: string;
  species: SpeciesId;
  onPlay: () => void;
};

export function AboutPage({ hatched, petName, species, onPlay }: Props) {
  return (
    <>
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
