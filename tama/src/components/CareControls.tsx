import { BALL, HEART, RICE_BALL, Z } from "../art/sprites";
import type { CareAction } from "../game/careLogic";
import { PixelArt } from "./PixelArt";

const ACTIONS: { id: CareAction; label: string; sprite: typeof BALL }[] = [
  { id: "feed", label: "Feed", sprite: RICE_BALL },
  { id: "play", label: "Play", sprite: BALL },
  { id: "rest", label: "Rest", sprite: Z },
  { id: "pat", label: "Pat", sprite: HEART },
];

const EXTRA = {
  talk: "M4 5h16v11H9l-4 4v-4H4z",
  stats: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
  style: "M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8zM18 15l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z",
};

export function CareControls({
  onCare,
  disabled,
  asleep,
  onTalk,
  onStats,
  onStyle,
  onHelp,
}: {
  onCare: (a: CareAction) => void;
  disabled: boolean;
  asleep: boolean;
  onTalk: () => void;
  onStats: () => void;
  onStyle: () => void;
  onHelp: () => void;
}) {
  const secondaryControls = [
    { label: "Stats", icon: EXTRA.stats, onClick: onStats, disabled },
    { label: "Customise", icon: EXTRA.style, onClick: onStyle, disabled: false },
  ];
  return (
    <div className="care-controls" role="group" aria-label="Care for your pet">
      <div className="care-row">
        {ACTIONS.map((a) => (
          <button key={a.id} type="button" className={`care-btn care-${a.id}`} onClick={() => onCare(a.id)} disabled={disabled}>
            <PixelArt grid={a.sprite.grid} palette={a.sprite.palette} size={18} />
            <span>{a.id === "rest" && asleep ? "Wake" : a.label}</span>
          </button>
        ))}
        <button type="button" className="care-btn care-talk" onClick={onTalk} disabled={disabled}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={EXTRA.talk} />
          </svg>
          <span>Talk</span>
        </button>
      </div>
      <div className="care-secondary">
        {secondaryControls.map((control) => (
          <button key={control.label} type="button" className="care-link" onClick={control.onClick} disabled={control.disabled}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={control.icon} />
          </svg>
            <span>{control.label}</span>
          </button>
        ))}
        <button type="button" className="care-link" onClick={onHelp} aria-label="How to play">
          <span aria-hidden="true">?</span><span>Help</span>
        </button>
      </div>
    </div>
  );
}
