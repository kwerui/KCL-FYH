import type { SpeciesId } from "../art/pets";
import { SceneArt, type SceneId } from "../art/scenes";
import { skinById } from "../art/skins";
import { PetSprite } from "./PetSprite";
import { TamagotchiShell } from "./TamagotchiShell";

/** A row-scrolling wall of scene tiles, each with a pet in it. */
const WALL: { scene: SceneId; pet: SpeciesId }[][] = [
  [
    { scene: "sky", pet: "shroomi" }, { scene: "bedroom", pet: "mothie" }, { scene: "night", pet: "twinkle" },
    { scene: "garden", pet: "peachi" }, { scene: "beach", pet: "jelli" }, { scene: "candy", pet: "bubbo" },
  ],
  [
    { scene: "snow", pet: "nimbu" }, { scene: "city", pet: "toasty" }, { scene: "garden", pet: "pebbl" },
    { scene: "sky", pet: "twinkle" }, { scene: "bedroom", pet: "shroomi" }, { scene: "beach", pet: "peachi" },
  ],
  [
    { scene: "candy", pet: "jelli" }, { scene: "night", pet: "bubbo" }, { scene: "sky", pet: "mothie" },
    { scene: "snow", pet: "pebbl" }, { scene: "city", pet: "nimbu" }, { scene: "garden", pet: "toasty" },
  ],
];

function SceneTile({ scene, pet }: { scene: SceneId; pet: SpeciesId }) {
  return (
    <div className="scene-tile">
      <SceneArt id={scene} className="fill" />
      <span className="tile-pet">
        <PetSprite species={pet} evolution="buddy" plain blink={false} className="fill" />
      </span>
    </div>
  );
}

export function SceneWall() {
  return (
    <div className="scene-wall" aria-hidden="true">
      {WALL.map((row, i) => (
        <div key={i} className={`wall-row ${i % 2 ? "rev" : ""}`}>
          <div className="wall-track">
            {[...row, ...row].map((t, j) => (
              <SceneTile key={j} scene={t.scene} pet={t.pet} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Shells in different sizes and colours, each with a pet hopping around its own scene. */
const SHOWCASE: { skin: string; scene: SceneId; pets: SpeciesId[]; cls: string }[] = [
  { skin: "lilac", scene: "bedroom", pets: ["mothie", "shroomi"], cls: "s-big" },
  { skin: "mint-polka", scene: "garden", pets: ["peachi"], cls: "s-med" },
  { skin: "starry-night", scene: "night", pets: ["twinkle"], cls: "s-small" },
  { skin: "sweetheart", scene: "beach", pets: ["jelli"], cls: "s-tiny" },
  { skin: "clear-aqua", scene: "snow", pets: ["nimbu"], cls: "s-mini" },
];

export function ShellCluster({ onClick }: { onClick: () => void }) {
  return (
    <div className="shell-cluster">
      {SHOWCASE.map((s, i) => (
        <div key={s.skin} className={`cluster-shell ${s.cls}`} style={{ animationDelay: `${i * -0.9}s` }}>
          <TamagotchiShell skin={skinById(s.skin)} selected={-1} attention={false} onIcon={onClick} onButton={onClick}>
            <button type="button" className="lcd-scene showcase-lcd" onClick={onClick} aria-label="Go to My Pet">
              <SceneArt id={s.scene} className="fill scene-bg" />
              {s.pets.map((p, k) => (
                <span key={p} className={`crowd-pet c${(i + k) % 3}`}>
                  <span className="crowd-hop">
                    <PetSprite species={p} evolution="buddy" plain className="fill" />
                  </span>
                </span>
              ))}
            </button>
          </TamagotchiShell>
        </div>
      ))}
    </div>
  );
}

