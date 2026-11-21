import type { PetMode } from "../ai/types";

export const MODES: { id: PetMode; label: string; hint: string }[] = [
  { id: "silly", label: "Silly", hint: "Jokes and a guessing game" },
  { id: "serious", label: "Serious", hint: "Breaks tasks into steps" },
  { id: "study", label: "Study", hint: "Focus timer and quiz" },
  { id: "companion", label: "Companion", hint: "Chats and remembers" },
];

export function ModeSelector({ current, onChange }: { current: PetMode; onChange: (m: PetMode) => void }) {
  return (
    <div className="mode-row" role="tablist" aria-label="Conversation mode">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={current === m.id}
          className={`mode-btn mode-${m.id} ${current === m.id ? "active" : ""}`}
          onClick={() => onChange(m.id)}
          title={m.hint}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
