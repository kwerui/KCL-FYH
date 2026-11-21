import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { PetEmotion } from "../ai/types";
import { BALL, HEART, RICE_BALL, RICE_BALL_BITTEN, SPARKLE, TEAR, Z, type Sprite } from "../art/sprites";
import type { PetState } from "../game/petState";
import type { RLAction } from "../game/rl";
import { PetCrowd } from "./PetCrowd";
import { PixelArt } from "./PixelArt";
import { PetSprite } from "./PetSprite";

export type FxKind = "feed" | "play" | "pat" | "evolve" | "hatch" | "win" | "rest";
export type Fx = { kind: FxKind; id: number };

type Props = {
  pet: PetState;
  emotion: PetEmotion;
  fx: Fx | null;
  view: "pet" | "stats";
  nudge: RLAction | null;
  cracked: boolean;
  onPetClick: () => void;
  onEggClick: () => void;
};

const LCD_W = 220;
const PET_W = 90; // 20 grid units * 4.5
const MIN_X = 4;
const MAX_X = LCD_W - PET_W - 4;

const u = (n: number) => `calc(var(--u) * ${n})`;

const FX_MS: Record<FxKind, number> = { feed: 2600, play: 2800, pat: 1300, evolve: 2200, hatch: 1600, win: 1800, rest: 1200 };

const MODE_LABEL: Record<string, string> = { silly: "SILLY", serious: "SERIOUS", study: "STUDY", companion: "COMPANION" };

function Sp({ s, size, style, className }: { s: Sprite; size: number; style?: CSSProperties; className?: string }) {
  return (
    <span className={`lcd-sprite ${className ?? ""}`} style={{ width: u(size), ...style }}>
      <PixelArt grid={s.grid} palette={s.palette} size={100} className="fill" />
    </span>
  );
}

export function LcdScene({ pet, emotion, fx, view, nudge, cracked, onPetClick, onEggClick }: Props) {
  const [x, setX] = useState(65);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [active, setActive] = useState<Fx | null>(null);
  const [chomp, setChomp] = useState(0);
  const [hopping, setHopping] = useState(false);
  const xRef = useRef(x);
  xRef.current = x;

  // Play the latest effect.
  useEffect(() => {
    if (!fx) return;
    setActive(fx);
    if (fx.kind === "feed") {
      setX(26);
      setFacing(1);
      setChomp(0);
      const bites = [900, 1300, 1700].map((t, i) => setTimeout(() => setChomp(i + 1), t));
      const end = setTimeout(() => setActive(null), FX_MS.feed);
      return () => {
        bites.forEach(clearTimeout);
        clearTimeout(end);
      };
    }
    if (fx.kind === "play") {
      setX(MAX_X - 10);
      setFacing(-1);
    }
    const end = setTimeout(() => setActive(null), FX_MS[fx.kind]);
    return () => clearTimeout(end);
  }, [fx]);

  // Wander around the screen.
  const busy = !!active || pet.asleep || !pet.hatched || view === "stats";
  const pace = pet.mode === "silly" ? 1400 : pet.mode === "serious" ? 4200 : 2600;
  useEffect(() => {
    if (busy) return;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      t = setTimeout(() => {
        const cur = xRef.current;
        let next = cur + (Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 45);
        if (Math.random() < 0.25) next = cur; // sometimes just jump on the spot
        next = Math.max(MIN_X, Math.min(MAX_X, next));
        if (next !== cur) setFacing(next > cur ? 1 : -1);
        setX(next);
        setHopping(true);
        setTimeout(() => setHopping(false), 1300);
        step();
      }, pace * (0.6 + Math.random() * 0.8));
    };
    step();
    return () => clearTimeout(t);
  }, [busy, pace]);

  // Before hatching, the screen shows the pets bouncing around (cycles through all nine).
  const attract = !pet.hatched && !cracked;

  const anim = active
    ? `fx-${active.kind}`
    : pet.asleep
      ? "emo-asleep"
      : hopping && emotion !== "sad" && emotion !== "sleepy"
        ? "walk-hop"
        : `emo-${emotion}`;

  const bubble: Sprite | string | null = (() => {
    if (!pet.hatched || pet.asleep || active) return null;
    if (nudge === "feed") return RICE_BALL;
    if (nudge === "play") return BALL;
    if (nudge === "rest") return Z;
    if (nudge === "chat") return "...";
    if (emotion === "thinking") return "?";
    if (emotion === "sad") return TEAR;
    if (emotion === "hungry") return RICE_BALL;
    if (emotion === "sleepy") return Z;
    if (emotion === "excited") return "!";
    return null;
  })();

  const petLeft = pet.hatched ? x : (LCD_W - PET_W) / 2;

  return (
    <div className={`lcd-scene ${pet.asleep ? "night" : ""}`}>
      <div className="lcd-grid" />
      {pet.hatched && <div className="lcd-mode">{MODE_LABEL[pet.mode]}</div>}

      {view === "stats" && pet.hatched ? (
        <div className="lcd-stats">
          {(
            [
              ["FULL", 100 - pet.hunger],
              ["ENERGY", pet.energy],
              ["HAPPY", pet.happiness],
              ["CURIOUS", pet.curiosity],
              ["PLAYFUL", pet.playfulness],
              ["FRIEND", pet.friendship],
            ] as const
          ).map(([label, v]) => (
            <div key={label} className="lcd-stat">
              <span>{label}</span>
              <span className="pips">
                {Array.from({ length: 8 }, (_, i) => (
                  <i key={i} className={i < Math.round(v / 12.5) ? "on" : ""} />
                ))}
              </span>
            </div>
          ))}
          <div className="lcd-hint">C to close</div>
        </div>
      ) : (
        <>
          {attract && <PetCrowd onClick={onEggClick} label="Tap to hatch your own pet" />}
          {!attract && (
          <button
            type="button"
            className={`pet-wrap ${pet.hatched ? "" : "egg"} ${active?.kind === "evolve" || active?.kind === "hatch" ? "flash" : ""}`}
            style={{ left: u(petLeft) }}
            onClick={pet.hatched ? onPetClick : onEggClick}
            aria-label={pet.hatched ? `Pat ${pet.petName}` : "Tap the egg"}
          >
            <span className={`pet-flip ${facing < 0 ? "left" : ""}`}>
              <span className={`pet-anim ${anim} ${pet.evolution === "hatchling" ? "small" : ""}`} key={active?.id ?? "idle"}>
                <PetSprite
                  className="fill"
                  species={pet.species}
                  evolution={pet.hatched ? pet.evolution : "egg"}
                  eyesClosed={pet.asleep || emotion === "sleepy"}
                  cracked={cracked}
                />
              </span>
            </span>
          </button>
          )}

          {bubble && (
            <div className="lcd-bubble" style={{ left: u(Math.min(LCD_W - 34, petLeft + PET_W - 22)) }}>
              {typeof bubble === "string" ? <b>{bubble}</b> : <Sp s={bubble} size={14} />}
            </div>
          )}

          {active?.kind === "feed" && chomp < 3 && (
            <Sp s={chomp >= 1 ? RICE_BALL_BITTEN : RICE_BALL} size={26} className="food-drop" style={{ left: u(112) }} />
          )}
          {active?.kind === "play" && <Sp s={BALL} size={22} className="ball-bounce" />}
          {(active?.kind === "pat" || active?.kind === "win") &&
            [0, 1, 2].map((i) => (
              <Sp
                key={`${active.id}-${i}`}
                s={HEART}
                size={12}
                className="float-up"
                style={{ left: u(petLeft + 25 + i * 18), animationDelay: `${i * 120}ms` }}
              />
            ))}
          {(active?.kind === "evolve" || active?.kind === "hatch") &&
            [0, 1, 2, 3, 4].map((i) => (
              <Sp
                key={`${active.id}-s${i}`}
                s={SPARKLE}
                size={14}
                className="sparkle-pop"
                style={{ left: u(20 + i * 42), top: u(20 + (i % 2) * 50), animationDelay: `${i * 90}ms` }}
              />
            ))}
          {pet.asleep &&
            [0, 1, 2].map((i) => (
              <Sp
                key={`z${i}`}
                s={Z}
                size={10 - i * 2}
                className="z-float"
                style={{ left: u(petLeft + 70 + i * 10), animationDelay: `${i * 0.7}s` }}
              />
            ))}
          {!pet.hatched && <div className="lcd-hint bottom">{cracked ? "!!!" : "tap to hatch"}</div>}
        </>
      )}
    </div>
  );
}
