import { useCallback, useEffect, useRef, useState } from "react";
import { ALL_SPECIES, SPECIES_IDS, type SpeciesId } from "../art/pets";
import type { Page } from "./Brand";
import { PetSprite } from "./PetSprite";

/** A sheet of pet stickers on the left. Drag them anywhere on the page; drag back onto the sheet to peel off. */

type Placed = { id: number; species: SpeciesId; page: Page; dx: number; y: number; rot: number; size: number };
type Drag = {
  species: SpeciesId;
  rot: number;
  size: number;
  x: number; // pointer, viewport px
  y: number;
  ox: number; // pointer offset inside the sticker
  oy: number;
  fromPlaced: boolean;
};

const KEY = "tama_stickers";
const MAX = 60;
let nextId = Date.now();

function load(): Placed[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((s) => SPECIES_IDS.includes(s.species)) : [];
  } catch {
    return [];
  }
}

const centreX = () => document.documentElement.clientWidth / 2;
const randomRot = () => Math.round((Math.random() * 2 - 1) * 14);

export function StickerRail({ page }: { page: Page }) {
  const [placed, setPlaced] = useState<Placed[]>(load);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [open, setOpen] = useState(false);
  const [overRail, setOverRail] = useState(false);
  const [justDropped, setJustDropped] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const railRef = useRef<HTMLElement>(null);
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(placed.slice(-MAX)));
    } catch {
      /* storage blocked */
    }
  }, [placed]);

  useEffect(() => {
    document.body.classList.toggle("rail-open", open);
  }, [open]);

  // Stickers are stored relative to the page centre, so re-place them when the window resizes.
  useEffect(() => {
    const onResize = () => setTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isOverRail = (x: number, y: number) => {
    const r = railRef.current?.getBoundingClientRect();
    return !!r && open && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  // Follow the pointer while dragging.
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      setOverRail(isOverRail(e.clientX, e.clientY));
    };
    const up = (e: PointerEvent) => {
      const d = dragRef.current;
      setDrag(null);
      setOverRail(false);
      document.body.classList.remove("dragging-sticker");
      if (!d || isOverRail(e.clientX, e.clientY)) return; // dropped back on the sheet: peeled off
      const left = e.clientX - d.ox + window.scrollX;
      const top = e.clientY - d.oy + window.scrollY;
      const id = nextId++;
      setPlaced((p) => [...p, { id, species: d.species, page, dx: left - centreX(), y: top, rot: d.rot, size: d.size }].slice(-MAX));
      setJustDropped(id);
      setTimeout(() => setJustDropped((j) => (j === id ? null : j)), 400);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!drag, page, open]);

  const startFromRail = useCallback((species: SpeciesId, e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const size = 84;
    window.getSelection()?.removeAllRanges();
    document.body.classList.add("dragging-sticker");
    setDrag({
      species,
      rot: randomRot(),
      size,
      x: e.clientX,
      y: e.clientY,
      ox: ((e.clientX - r.left) / r.width) * size,
      oy: ((e.clientY - r.top) / r.height) * size * 1.3,
      fromPlaced: false,
    });
  }, []);

  const startFromPlaced = useCallback((s: Placed, e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    window.getSelection()?.removeAllRanges();
    document.body.classList.add("dragging-sticker");
    setPlaced((p) => p.filter((x) => x.id !== s.id));
    setDrag({
      species: s.species,
      rot: s.rot,
      size: s.size,
      x: e.clientX,
      y: e.clientY,
      ox: e.clientX - r.left,
      oy: e.clientY - r.top,
      fromPlaced: true,
    });
  }, []);

  const here = placed.filter((s) => s.page === page);

  return (
    <>
      <div className="sticker-layer" aria-hidden="true">
        {here.map((s) => (
          <span
            key={s.id}
            className={`sticker placed ${justDropped === s.id ? "slap" : ""}`}
            style={{ left: centreX() + s.dx, top: s.y, width: s.size, ["--rot" as string]: `${s.rot}deg` }}
            onPointerDown={(e) => startFromPlaced(s, e)}
            title="Drag me around, or back onto the sheet to peel me off"
          >
            <PetSprite species={s.species} evolution="buddy" plain blink={false} className="fill" />
          </span>
        ))}
      </div>

      {drag && (
        <span
          className="sticker dragging"
          style={{
            left: drag.x - drag.ox,
            top: drag.y - drag.oy,
            width: drag.size,
            ["--rot" as string]: `${drag.rot}deg`,
          }}
          aria-hidden="true"
        >
          <PetSprite species={drag.species} evolution="buddy" plain blink={false} className="fill" />
        </span>
      )}

      <aside
        ref={railRef}
        className={`sticker-rail ${open ? "open" : ""} ${overRail ? "peel" : ""} ${drag ? "busy" : ""}`}
        aria-label="Sticker sheet"
      >
        <button type="button" className="rail-tab" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span className="pixel">STICKERS</span>
        </button>
        <div className="rail-sheet">
          <p className="rail-hint">{overRail ? "let go to peel off" : "drag me!"}</p>
          {ALL_SPECIES.map((s, i) => (
            <span
              key={s.id}
              className="sticker on-sheet"
              style={{ ["--rot" as string]: `${i % 2 ? 6 : -6}deg` }}
              onPointerDown={(e) => startFromRail(s.id, e)}
              title={`${s.name} sticker: drag it anywhere`}
              role="button"
              aria-label={`${s.name} sticker`}
            >
              <PetSprite species={s.id} evolution="buddy" plain blink={false} className="fill" />
            </span>
          ))}
          {here.length > 0 && (
            <button type="button" className="rail-clear" onClick={() => setPlaced((p) => p.filter((s) => s.page !== page))}>
              peel all
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
