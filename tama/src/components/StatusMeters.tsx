import { useState } from "react";
import { ALL_SPECIES, SPECIES, type SpeciesId } from "../art/pets";
import { FORM_INFO, evolutionProgress } from "../game/evolutionLogic";
import type { PetState } from "../game/petState";
import { PetSprite } from "./PetSprite";

function Pips({ value, color, label }: { value: number; color: string; label: string }) {
  const on = Math.round(value / 10);
  return (
    <div className="stat-row" aria-label={`${label} ${Math.round(value)} out of 100`}>
      <span className="stat-label">{label}</span>
      <span className="pips" style={{ ["--pip" as string]: color }}>
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className={i < on ? "on" : ""} />
        ))}
      </span>
    </div>
  );
}

function Bar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="trait-row">
      <span className="stat-label">{label}</span>
      <span className="trait-bar">
        <i style={{ width: `${value}%`, background: color }} />
      </span>
      <span className="trait-num">{Math.round(value)}</span>
    </div>
  );
}

export function StatusMeters({
  state,
  brainNote,
  onReset,
}: {
  state: PetState;
  brainNote: string;
  onReset: (keepBrain: boolean) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [keepBrain, setKeepBrain] = useState(false);
  const days = Math.max(1, Math.floor((Date.now() - state.bornAt) / 60000) + 1);
  const progress = evolutionProgress(state);
  return (
    <section className="card status-card" aria-label="Pet status">
      <div className="pet-row">
        <div className="mini-screen">
          <PetSprite species={state.species} evolution={state.evolution} eyesClosed={state.asleep} className="fill" />
        </div>
        <div>
          <h3 className="pet-name">{state.petName}</h3>
          <span className="stage-pill">
            {FORM_INFO[state.evolution].name.toUpperCase()} / {SPECIES[state.species].name.toUpperCase()} / MIN {days}
          </span>
        </div>
      </div>
      <Pips label="FULL" value={100 - state.hunger} color="#FFB38A" />
      <Pips label="ENERGY" value={state.energy} color="#8FE3C6" />
      <Pips label="HAPPY" value={state.happiness} color="#F7A6B9" />
      <div className="traits">
        <Bar label="CURIOUS" value={state.curiosity} color="#6F9BE0" />
        <Bar label="PLAYFUL" value={state.playfulness} color="#FFB13D" />
        <Bar label="FRIEND" value={state.friendship} color="#F583B4" />
      </div>
      {(state.evolution === "hatchling" || state.evolution === "egg") && (
        <div className="evo-progress" aria-label="Progress to first evolution">
          <span>Evolution</span>
          <span className="trait-bar">
            <i style={{ width: `${progress * 100}%` }} />
          </span>
        </div>
      )}
      <p className="brain-note">{brainNote}</p>
      {confirm ? (
        <div className="reset-confirm" role="alertdialog" aria-label="Get a new pet">
          <p>
            <b>Say goodbye to {state.petName}?</b> You'll get a fresh egg and can pick a new pet. Your shell stays.
          </p>
          <label className="toggle">
            <input type="checkbox" checked={keepBrain} onChange={(e) => setKeepBrain(e.target.checked)} />
            <span>Keep what it learned about my habits</span>
          </label>
          <div className="row-gap">
            <button type="button" className="btn btn-primary small" onClick={() => onReset(keepBrain)}>
              Yes, new egg
            </button>
            <button type="button" className="btn btn-secondary small" onClick={() => setConfirm(false)}>
              Keep {state.petName}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-secondary small new-pet-btn" onClick={() => setConfirm(true)}>
          Get a new pet
        </button>
      )}
    </section>
  );
}

export function HatchCard({
  name,
  setName,
  species,
  setSpecies,
  onHatch,
  hatching,
  inputRef,
}: {
  name: string;
  setName: (s: string) => void;
  species: SpeciesId | "surprise";
  setSpecies: (s: SpeciesId | "surprise") => void;
  onHatch: () => void;
  hatching: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <section className="card hatch-card" aria-label="Hatch your pet">
      <h3>Hatch your egg</h3>
      <p className="muted">Name it, pick who's inside (or leave it a surprise), then tap the screen or press Hatch.</p>
      <label className="field">
        <span>Name</span>
        <input
          ref={inputRef}
          value={name}
          maxLength={12}
          placeholder="e.g. Pixel"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onHatch()}
        />
      </label>
      <div className="species-pick" role="radiogroup" aria-label="Choose your pet">
        <button
          type="button"
          role="radio"
          aria-checked={species === "surprise"}
          className={`species-chip surprise ${species === "surprise" ? "active" : ""}`}
          onClick={() => setSpecies("surprise")}
          title="Surprise me"
        >
          ?
        </button>
        {ALL_SPECIES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={species === s.id}
            className={`species-chip ${species === s.id ? "active" : ""}`}
            onClick={() => setSpecies(s.id)}
            title={s.name}
          >
            <PetSprite species={s.id} evolution="hatchling" blink={false} className="fill" />
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary wide" onClick={onHatch} disabled={!name.trim() || hatching}>
        {hatching ? "Hatching..." : "Hatch!"}
      </button>
    </section>
  );
}
