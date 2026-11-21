import type { ReactNode } from "react";
import type { Skin } from "../art/skins";
import { ShellArt } from "./ShellArt";

export type IconId = "feed" | "play" | "rest" | "study" | "talk" | "stats" | "mode" | "attention";
export const ICONS: { id: IconId; label: string; path: string }[] = [
  { id: "feed", label: "Feed", path: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 3-3 6s1 4 3 4v8V3z" },
  { id: "play", label: "Play", path: "M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16zM4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" },
  { id: "rest", label: "Lights / sleep", path: "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z" },
  { id: "study", label: "Study", path: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 21a2 2 0 0 1 2-2h13" },
  { id: "talk", label: "Talk", path: "M4 5h16v11H9l-4 4v-4H4z" },
  { id: "stats", label: "Stats", path: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" },
  { id: "mode", label: "Switch mode", path: "M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8zM18 15l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z" },
  { id: "attention", label: "Attention: your pet wants something", path: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7v6M12 16.5v.5" },
];

type Props = {
  skin: Skin;
  selected: number;
  attention: boolean;
  onIcon: (id: IconId, index: number) => void;
  onButton: (b: "A" | "B" | "C") => void;
  children: ReactNode;
  disabled?: boolean;
};

export function TamagotchiShell({ skin, selected, attention, onIcon, onButton, children, disabled }: Props) {
  const iconBtn = (i: number) => {
    const ic = ICONS[i];
    const lit = ic.id === "attention" && attention;
    return (
      <button
        key={ic.id}
        type="button"
        className={`bezel-icon ${selected === i ? "selected" : ""} ${lit ? "lit" : ""}`}
        onClick={() => onIcon(ic.id, i)}
        aria-label={ic.label}
        title={ic.label}
        disabled={disabled}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={ic.path} />
        </svg>
      </button>
    );
  };

  return (
    <div className="device" style={{ ["--edge" as string]: skin.edge }}>
      <ShellArt skin={skin} />
      <div className="bezel">
        <div className="icon-row">{[0, 1, 2, 3].map(iconBtn)}</div>
        <div className="lcd">{children}</div>
        <div className="icon-row">{[4, 5, 6, 7].map(iconBtn)}</div>
      </div>
      {(["A", "B", "C"] as const).map((b) => (
        <button
          key={b}
          type="button"
          className={`hw-btn hw-${b}`}
          onClick={() => onButton(b)}
          aria-label={b === "A" ? "A: next icon" : b === "B" ? "B: select" : "C: cancel / pat"}
          title={b === "A" ? "A: next icon" : b === "B" ? "B: select" : "C: cancel / pat"}
        >
          <span>{b}</span>
        </button>
      ))}
    </div>
  );
}
