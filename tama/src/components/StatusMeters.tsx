import { useState } from "react";
import { ALL_SPECIES, SPECIES, type SpeciesId } from "../art/pets";
import { FORM_INFO, evolutionProgress, msUntilCanEvolve, formatTimeUntil } from "../game/evolutionLogic";
import { resolvePetName, type PetState } from "../game/petState";
import { PetSprite } from "./PetSprite";
import { PixelArt } from "./PixelArt";
import { BOLT, HEART_CLIP, RICE_BALL, emptyOf, type Sprite } from "../art/sprites";

function IconMeter({ value, label, sprite }: { value: number; label: string; sprite: Sprite }) {
  const on = Math.round(value / 20);
  const empty = emptyOf(sprite);
  return (
    <div className="stat-row" aria-label={`${label} ${Math.round(value)} out of 100`}>
      <span className="stat-label">{label}</span>
      <span className="icon-meter">
        {Array.from({ length: 5 }, (_, i) => {
          const s = i < on ? sprite : empty;
          return <PixelArt key={i} grid={s.grid} palette={s.palette} size={22} className={i < on ? "on" : ""} />;
        })}
      </span>
    </div>
  );
}

function Bar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="trait-row">
      <span className="stat-label">{label}</span>
      <span className="seg-bar" style={{ ["--c" as string]: color }}>
        <i style={{ width: `${value}%` }} />
      </span>
      <span className="trait-num">{Math.round(value)}</span>
    </div>
  );
}

export function PetSummary({ state, status }: { state: PetState; status: string }) {
  const petName = resolvePetName(state.petName, state.species);
  return (
    <section className="pet-summary" aria-label="Pet overview">
      <div className="pet-summary-head">
        <div>
          <p className="eyebrow pixel">YOUR PET</p>
          <h1 className="pet-name">{petName}</h1>
        </div>
        <span className="pill pixel">{FORM_INFO[state.evolution].name.toUpperCase()}</span>
      </div>
      <p className="pet-summary-stage">{SPECIES[state.species].name} · {state.asleep ? "resting" : "ready for today"}</p>
      <div className="needs pet-summary-needs">
        <IconMeter label="FULLNESS" value={100 - state.hunger} sprite={RICE_BALL} />
        <IconMeter label="ENERGY" value={state.energy} sprite={BOLT} />
        <IconMeter label="HAPPINESS" value={state.happiness} sprite={HEART_CLIP} />
      </div>
      <p className="pet-summary-status" role="status">{status}</p>
    </section>
  );
}

export function PetDetails({
  state,
  brainNote,
  onReset,
  age,
  demo,
  now,
}: {
  state: PetState;
  brainNote: string;
  onReset: (keepBrain: boolean) => void;
  age: string;
  demo: boolean;
  now: Date;
}) {
  const [confirm, setConfirm] = useState(false);
  const [keepBrain, setKeepBrain] = useState(false);
  const progress = evolutionProgress(state);
  const msLeft = state.hatched ? msUntilCanEvolve(state.bornAt, demo, now.getTime()) : 0;
  return (
    <section className="card status-card" aria-label="Pet status">
      <div className="pet-row">
        <div className="mini-screen">
          <PetSprite species={state.species} evolution={state.evolution} eyesClosed={state.asleep} className="fill" />
        </div>
        <div>
          <h3 className="pet-name">{state.petName}</h3>
          <p className="pet-sub pixel">
            {FORM_INFO[state.evolution].name} {SPECIES[state.species].name}, {age}
          </p>
        </div>
      </div>
      <div className="needs">
        <IconMeter label="FULL" value={100 - state.hunger} sprite={RICE_BALL} />
        <IconMeter label="ENERGY" value={state.energy} sprite={BOLT} />
        <IconMeter label="HAPPY" value={state.happiness} sprite={HEART_CLIP} />
      </div>
      <div className="traits">
        <Bar label="CURIOUS" value={state.curiosity} color="#6F9BE0" />
        <Bar label="PLAYFUL" value={state.playfulness} color="#FFB13D" />
        <Bar label="FRIEND" value={state.friendship} color="#F583B4" />
      </div>
      {(state.evolution === "hatchling" || state.evolution === "egg") && (
        <div className="evo-progress" aria-label="Progress to first evolution">
          <span>Evolution</span>
          <span className="seg-bar" style={{ ["--c" as string]: "#8F7BE0" }}>
            <i style={{ width: `${progress * 100}%` }} />
          </span>
        </div>
      )}
      {state.hatched && (state.evolution === "hatchling" || state.evolution === "egg") && msLeft > 0 && (
        <p className="muted small grow-up-note">
          Grows up in <b>{formatTimeUntil(msLeft)}</b>
        </p>
      )}
      <p className="brain-note">
        <span className="pixel">BRAIN</span> {brainNote}
      </p>
      {confirm ? (
        <div className="reset-confirm" role="alertdialog" aria-label="Get a new pet">
          <p>
            <b>Say goodbye to {state.petName}?</b> You'll get a fresh egg and can pick a new pet. Your shell stays.
          </p>
          <label className="toggle">
            <input type="checkbox" checked={keepBrain} onChange={(e) => setKeepBrain(e.target.checked)} />
            <span>Keep what it learned about my habits and routine</span>
          </label>
          <div className="row-gap">
            <button type="button" className="pixel-btn" onClick={() => onReset(keepBrain)}>
              YES, NEW EGG
            </button>
            <button type="button" className="pixel-btn plain" onClick={() => setConfirm(false)}>
              KEEP {state.petName.toUpperCase()}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="pixel-btn new-pet-btn" onClick={() => setConfirm(true)}>
          NEW EGG
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
      <p className="muted">Tap the egg on the screen three times to hatch it. Name it and pick who's inside first if you like, or leave it a surprise.</p>
      <label className="field">
        <span>Name (optional)</span>
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
      <button type="button" className="btn btn-primary wide" onClick={onHatch} disabled={hatching}>
        {hatching ? "Hatching..." : "Hatch now"}
      </button>
    </section>
  );
}
