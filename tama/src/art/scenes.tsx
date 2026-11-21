import { memo } from "react";

/** Original pixel scene backgrounds for the LCD, drawn on a 220 x 160 canvas with 4-unit "pixels". */

type R = [number, number, number, number, string];

export type SceneId = "lcd" | "sky" | "garden" | "bedroom" | "beach" | "night" | "snow" | "city" | "candy";

export const SCENES: { id: SceneId; name: string; dark?: boolean }[] = [
  { id: "lcd", name: "Classic LCD" },
  { id: "sky", name: "Sunny Meadow" },
  { id: "garden", name: "Veggie Patch" },
  { id: "bedroom", name: "Cosy Room" },
  { id: "beach", name: "Sunset Beach" },
  { id: "night", name: "Starry Hill", dark: true },
  { id: "snow", name: "Snow Day" },
  { id: "city", name: "City Dusk", dark: true },
  { id: "candy", name: "Candy Land" },
];

const rand = (seed: number) => {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
};

/** Pixel circle made of 4-unit rows. */
function circle(cx: number, cy: number, r: number, fill: string): R[] {
  const out: R[] = [];
  for (let y = -r; y < r; y += 4) {
    const half = Math.round(Math.sqrt(Math.max(0, r * r - (y + 2) * (y + 2))) / 4) * 4;
    if (half > 0) out.push([cx - half, cy + y, half * 2, 4, fill]);
  }
  return out;
}

function cloud(x: number, y: number, s = 1): R[] {
  return [
    [x + 8 * s, y, 24 * s, 4 * s, "#FFFFFF"],
    [x + 4 * s, y + 4 * s, 36 * s, 4 * s, "#FFFFFF"],
    [x, y + 8 * s, 48 * s, 8 * s, "#FFFFFF"],
    [x + 4 * s, y + 16 * s, 40 * s, 4 * s, "#E3F2FF"],
  ];
}

function flowers(seed: number, y0: number, y1: number, cols: string[]): R[] {
  const r = rand(seed);
  const out: R[] = [];
  for (let i = 0; i < 14; i++) {
    const x = Math.floor((r() * 212) / 4) * 4;
    const y = y0 + Math.floor((r() * (y1 - y0)) / 4) * 4;
    out.push([x, y + 4, 4, 4, "#4E9E48"], [x, y, 4, 4, cols[i % cols.length]]);
  }
  return out;
}

function pine(x: number, y: number): R[] {
  return [
    [x + 12, y, 8, 4, "#3E8E6A"], [x + 8, y + 4, 16, 8, "#3E8E6A"], [x + 10, y + 4, 6, 4, "#FFFFFF"],
    [x + 4, y + 12, 24, 8, "#2F7A58"], [x + 6, y + 12, 8, 4, "#FFFFFF"],
    [x, y + 20, 32, 8, "#2F7A58"], [x + 4, y + 20, 10, 4, "#FFFFFF"],
    [x + 12, y + 28, 8, 8, "#8A5A3B"],
  ];
}

function lollipop(x: number, colour: string): R[] {
  return [[x + 10, 70, 4, 46, "#FFFFFF"], ...circle(x + 12, 58, 16, colour), [x + 6, 50, 4, 4, "#FFFFFF"], [x + 10, 58, 8, 4, "#FFFFFF"], [x + 14, 54, 4, 4, "#FFFFFF"]];
}

const BUILD: Record<Exclude<SceneId, "lcd">, () => R[]> = {
  sky: () => [
    [0, 0, 220, 40, "#8FD3FF"], [0, 40, 220, 40, "#A6DCFF"], [0, 80, 220, 32, "#BDE6FF"],
    ...circle(186, 26, 14, "#FFE27A"),
    ...cloud(16, 18), ...cloud(110, 44, 0.75),
    [0, 96, 76, 16, "#9FD98A"], [60, 100, 90, 12, "#B2E39C"], [140, 92, 80, 20, "#9FD98A"],
    [0, 112, 220, 48, "#8FD175"], [0, 112, 220, 4, "#6FBF5A"],
    ...flowers(3, 124, 152, ["#FF8FB1", "#FFE27A", "#FFFFFF"]),
  ],
  garden: () => {
    const out: R[] = [[0, 0, 220, 44, "#A6DCFF"], ...cloud(140, 6, 0.75)];
    for (let x = 0; x < 220; x += 16) out.push([x, 28, 12, 64, "#E8B97A"], [x + 4, 24, 4, 4, "#E8B97A"], [x + 2, 32, 2, 56, "#F2CC94"]);
    out.push([0, 42, 220, 4, "#C98A4B"], [0, 74, 220, 4, "#C98A4B"], [0, 92, 220, 68, "#7CC46A"], [0, 92, 220, 4, "#5FAE52"]);
    for (const [x, c] of [[12, "#E8545B"], [84, "#FF9A3D"], [156, "#A8D86E"]] as const) {
      out.push([x, 120, 52, 28, "#9C6B45"], [x + 4, 124, 44, 20, "#8A5A3B"]);
      for (let i = 0; i < 3; i++) out.push([x + 8 + i * 14, 112, 4, 10, "#4E9E48"], ...circle(x + 10 + i * 14, 128, 6, c));
    }
    return out;
  },
  bedroom: () => {
    const out: R[] = [[0, 0, 220, 112, "#FFE0EA"]];
    for (let y = 8; y < 108; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < 220; x += 16) out.push([x, y, 4, 4, "#FFC9DA"]);
    out.push(
      [64, 12, 92, 64, "#FFFFFF"], [68, 16, 84, 56, "#A6DCFF"], ...cloud(80, 24, 0.5), [108, 16, 4, 56, "#FFFFFF"], [68, 42, 84, 4, "#FFFFFF"],
      [54, 8, 14, 78, "#F5A3C0"], [152, 8, 14, 78, "#F5A3C0"], [52, 6, 116, 6, "#E0789F"],
      [10, 46, 40, 4, "#C98A4B"], [14, 30, 6, 16, "#6F9BE0"], [22, 34, 6, 12, "#FF9A6B"], [30, 28, 6, 18, "#8FE3C6"], [38, 36, 8, 10, "#FFE27A"],
      [176, 60, 24, 36, "#FFF1D6"], [172, 56, 32, 6, "#FFD86B"], [186, 96, 4, 16, "#C98A4B"],
      [0, 112, 220, 48, "#F2C9A0"], [0, 124, 220, 2, "#E0B58A"], [0, 140, 220, 2, "#E0B58A"],
      [52, 132, 116, 16, "#C9B6F2"], [60, 128, 100, 24, "#C9B6F2"], [68, 136, 84, 8, "#B9A7F0"],
    );
    return out;
  },
  beach: () => {
    const r = rand(9);
    const out: R[] = [
      [0, 0, 220, 24, "#7B6FD6"], [0, 24, 220, 20, "#B08AE0"], [0, 44, 220, 20, "#F59AC0"], [0, 64, 220, 16, "#FFB38A"], [0, 80, 220, 12, "#FFD86B"],
      [92, 68, 36, 4, "#FFF1A8"], [84, 72, 52, 8, "#FFF1A8"], [80, 80, 60, 12, "#FFF1A8"],
      [0, 92, 220, 24, "#3E95D6"], [96, 96, 28, 2, "#FFF1A8"], [100, 102, 20, 2, "#FFF1A8"], [104, 108, 12, 2, "#FFF1A8"],
      [0, 116, 220, 44, "#F6DFA4"], [0, 116, 220, 4, "#FFF3CC"],
    ];
    for (let i = 0; i < 8; i++) out.push([Math.floor(r() * 50) * 4, 96 + Math.floor(r() * 4) * 4, 12, 2, "#9ED8F5"]);
    for (let i = 0; i < 10; i++) out.push([Math.floor(r() * 54) * 4, 128 + Math.floor(r() * 7) * 4, 4, 4, "#E8C67F"]);
    out.push([24, 136, 8, 4, "#FF8FB1"], [172, 144, 8, 4, "#FFFFFF"]);
    return out;
  },
  night: () => {
    const r = rand(17);
    const out: R[] = [[0, 0, 220, 160, "#232B5E"], [0, 56, 220, 48, "#2D3A78"]];
    for (let i = 0; i < 26; i++) {
      const big = r() < 0.25;
      out.push([Math.floor(r() * 54) * 4, Math.floor(r() * 22) * 4, big ? 4 : 2, big ? 4 : 2, "#FFE27A"]);
    }
    out.push(...circle(178, 28, 14, "#FFF1A8"), ...circle(186, 24, 12, "#232B5E"));
    out.push([0, 100, 92, 60, "#1C2350"], [20, 92, 52, 8, "#1C2350"], [120, 104, 100, 56, "#1C2350"], [150, 96, 50, 8, "#1C2350"]);
    out.push([0, 124, 220, 36, "#2C4A3A"], [0, 124, 220, 4, "#3A6B4E"]);
    for (let i = 0; i < 7; i++) out.push([Math.floor(r() * 54) * 4, 128 + Math.floor(r() * 7) * 4, 4, 4, "#E9FF8A"]);
    return out;
  },
  snow: () => {
    const r = rand(5);
    const out: R[] = [[0, 0, 220, 112, "#DCEBFF"], [0, 72, 220, 40, "#E8F2FF"]];
    out.push(...pine(8, 64), ...pine(176, 58), ...pine(150, 76));
    for (let i = 0; i < 24; i++) out.push([Math.floor(r() * 55) * 4, Math.floor(r() * 26) * 4, 4, 4, "#FFFFFF"]);
    out.push([0, 112, 220, 48, "#FFFFFF"], [0, 112, 220, 4, "#CFE0F5"], [40, 140, 40, 4, "#E3EEFB"], [130, 132, 56, 4, "#E3EEFB"]);
    return out;
  },
  city: () => {
    const r = rand(21);
    const out: R[] = [[0, 0, 220, 40, "#7B6FD6"], [0, 40, 220, 30, "#B08AE0"], [0, 70, 220, 54, "#F59AC0"]];
    let x = 0;
    while (x < 220) {
      const w = 24 + Math.floor(r() * 4) * 8;
      const h = 40 + Math.floor(r() * 8) * 8;
      const c = r() < 0.5 ? "#3B2F4A" : "#4A3C6A";
      out.push([x, 124 - h, w - 4, h, c]);
      for (let wy = 124 - h + 8; wy < 116; wy += 10) for (let wx = x + 4; wx < x + w - 8; wx += 8) if (r() < 0.55) out.push([wx, wy, 4, 4, "#FFE27A"]);
      x += w;
    }
    out.push([0, 124, 220, 36, "#5A5868"], [0, 124, 220, 4, "#6E6A78"]);
    for (let i = 0; i < 220; i += 28) out.push([i + 6, 142, 14, 3, "#FFE27A"]);
    return out;
  },
  candy: () => {
    const out: R[] = [];
    for (let x = 0; x < 220; x += 16) out.push([x, 0, 8, 116, "#FFD1E3"], [x + 8, 0, 8, 116, "#FFF0F6"]);
    out.push(...cloud(70, 10, 0.75), ...lollipop(14, "#F583B4"), ...lollipop(170, "#8FE3C6"), ...lollipop(118, "#FFD24D"));
    out.push([0, 116, 220, 44, "#C9B6F2"], [0, 116, 220, 4, "#B9A7F0"]);
    const r = rand(13);
    const cols = ["#FF6B8B", "#FFD24D", "#6FB7F0", "#FFFFFF"];
    for (let i = 0; i < 18; i++) out.push([Math.floor(r() * 54) * 4, 124 + Math.floor(r() * 8) * 4, 6, 2, cols[i % 4]]);
    return out;
  },
};

const CACHE = new Map<SceneId, R[]>();

export const SceneArt = memo(function SceneArt({ id, className }: { id: SceneId; className?: string }) {
  if (id === "lcd") return null;
  let rects = CACHE.get(id);
  if (!rects) {
    rects = BUILD[id]();
    CACHE.set(id, rects);
  }
  return (
    <svg className={`scene-art ${className ?? ""}`} viewBox="0 0 220 160" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" aria-hidden="true">
      {rects.map(([x, y, w, h, f], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={f} />
      ))}
    </svg>
  );
});

const SCENE_KEY = "tama_scene";
export function loadSceneId(): SceneId {
  try {
    const v = localStorage.getItem(SCENE_KEY) as SceneId | null;
    return v && SCENES.some((s) => s.id === v) ? v : "lcd";
  } catch {
    return "lcd";
  }
}
export function saveSceneId(id: SceneId) {
  try {
    localStorage.setItem(SCENE_KEY, id);
  } catch {
    /* ignore */
  }
}
