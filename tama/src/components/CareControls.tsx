import { BALL, HEART, RICE_BALL, Z } from "../art/sprites";
import type { CareAction } from "../game/careLogic";
import { PixelArt } from "./PixelArt";

const ACTIONS: { id: CareAction; label: string; sprite: typeof BALL }[] = [
  { id: "feed", label: "Feed", sprite: RICE_BALL },
  { id: "play", label: "Play", sprite: BALL },
  { id: "rest", label: "Rest", sprite: Z },
  { id: "pat", label: "Pat", sprite: HEART },
];

export function CareControls({
  onCare,
  disabled,
  asleep,
}: {
  onCare: (a: CareAction) => void;
  disabled: boolean;
  asleep: boolean;
}) {
  return (
    <div className="care-row" role="group" aria-label="Care for your pet">
      {ACTIONS.map((a) => (
        <button key={a.id} type="button" className={`care-btn care-${a.id}`} onClick={() => onCare(a.id)} disabled={disabled}>
          <PixelArt grid={a.sprite.grid} palette={a.sprite.palette} size={18} />
          <span>{a.id === "rest" && asleep ? "Wake" : a.label}</span>
        </button>
      ))}
    </div>
  );
}
