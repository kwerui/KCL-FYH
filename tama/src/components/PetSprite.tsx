import { useEffect, useMemo, useState } from "react";
import { SPECIES, bottomRow, topRow, type SpeciesId } from "../art/pets";
import { EGG, EGG_CRACKED, EGGSHELL, HEART_CLIP, PARTY_HAT, SCHOLAR_CAP } from "../art/sprites";
import type { Evolution } from "../game/evolutionLogic";
import { PixelLayer } from "./PixelArt";

type Props = {
  species: SpeciesId;
  evolution: Evolution;
  eyesClosed?: boolean;
  cracked?: boolean;
  size?: number; // css px width; omit when sized by CSS
  className?: string;
  blink?: boolean;
  plain?: boolean; // no accessories
};

/** Canvas: 20 x 26 pixel units, pet's 16x16 grid at (2, 8). Room above for hats, below for the eggshell. */
export const SPRITE_W = 20;
export const SPRITE_H = 26;

export function PetSprite({ species, evolution, eyesClosed, cracked, size, className, blink = true, plain }: Props) {
  const sp = SPECIES[species];
  const palette = useMemo(() => ({ K: "#3B2F4A", W: "#FFFFFF", P: "#F7A6B9", ...sp.palette }), [sp]);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (!blink || evolution === "egg") return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 140);
        loop();
      }, 2200 + Math.random() * 2600);
    };
    loop();
    return () => clearTimeout(t);
  }, [blink, evolution]);

  const closed = eyesClosed || blinking;
  const overrides = useMemo(
    () => (closed ? sp.blink.map(([x, y]) => ({ x, y, ch: sp.blinkWith })) : undefined),
    [closed, sp],
  );

  const top = topRow(sp.grid);
  const bottom = bottomRow(sp.grid);
  const ox = 2;
  const oy = 8;

  if (evolution === "egg") {
    const egg = cracked ? EGG_CRACKED : EGG;
    return (
      <svg
        className={className}
        width={size}
        viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`}
        shapeRendering="crispEdges"
        aria-label="An egg"
        role="img"
      >
        <PixelLayer grid={egg.grid} palette={egg.palette} x={4} y={10} />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      width={size}
      viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${sp.name}, ${evolution.replace("_", " ")}`}
    >
      <PixelLayer grid={sp.grid} palette={palette} overrides={overrides} x={ox} y={oy} />
      {!plain && evolution === "scholar" && (
        <PixelLayer grid={SCHOLAR_CAP.grid} palette={SCHOLAR_CAP.palette} x={ox + 3} y={oy + top - 5} />
      )}
      {!plain && evolution === "chaos_sprite" && (
        <g transform={`rotate(-14 ${ox + 8} ${oy + top - 3})`}>
          <PixelLayer grid={PARTY_HAT.grid} palette={PARTY_HAT.palette} x={ox + 4} y={oy + top - 6} />
        </g>
      )}
      {!plain && evolution === "buddy" && (
        <PixelLayer grid={HEART_CLIP.grid} palette={HEART_CLIP.palette} x={ox + 10} y={oy + top - 3} />
      )}
      {!plain && evolution === "hatchling" && (
        <PixelLayer grid={EGGSHELL.grid} palette={EGGSHELL.palette} x={ox + 2} y={oy + bottom - 2} />
      )}
    </svg>
  );
}
