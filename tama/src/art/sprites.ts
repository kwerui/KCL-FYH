import { BASE, INK, type Palette, type PixelGrid } from "./pets";

export type Sprite = { grid: PixelGrid; palette: Palette };

const sprite = (grid: PixelGrid, palette: Palette = {}): Sprite => ({ grid, palette: { ...BASE, ...palette } });

/** Evolution accessories, drawn on top of the pet. */
export const SCHOLAR_CAP = sprite(
  ["...KKKK...", ".KKDDDDKK.", "KDDDDDDDDK", ".KKDDDDKKY", "..KDDDDK.Y", "..KKKKKK.Y"],
  { D: "#2D3A6B", Y: "#FFD24D" },
);

export const PARTY_HAT = sprite(
  ["...WW...", "...KK...", "..KPYK..", "..KYPK..", ".KPYPYK.", ".KYPYPK.", "KKKKKKKK"],
  { P: "#F583B4", Y: "#FFD24D" },
);

export const HEART_CLIP = sprite(
  [".KK.KK.", "KRRKRRK", "KRRRRRK", ".KRRRK.", "..KRK..", "...K..."],
  { R: "#FF6B8B" },
);

export const EGGSHELL = sprite(
  ["KK.KK..KK.KK", "KWKWWKKWWKWK", "KWWWWWWWWWWK", ".KWWWWWWWWK.", "..KKKKKKKK.."],
  { W: "#FFF8EC" },
);

export const EGG = sprite(
  [
    "....KKKK....", "...KWWWWK...", "..KWWWWWWK..", ".KWWLLWWWWK.", ".KWWLLWWWWK.",
    "KWWWWWWWLLWK", "KWWWWWWWLLWK", "KWWWWWWWWWWK", "KWLLWWWWWWWK", "KWLLWWWWWWWK",
    ".KWWWWWLLWK.", ".KWWWWWWWWK.", "..KKWWWWKK..", "....KKKK....",
  ],
  { W: "#FFF8EC", L: "#B9A7F0" },
);

export const EGG_CRACKED = sprite(
  [
    "....KKKK....", "...KWWWWK...", "..KWWWWWWK..", ".KWWLLWWWWK.", ".KWWLKWWWWK.",
    "KWWWWWKWLLWK", "KWWWWKWKLLWK", "KWWWKWWWKWWK", "KWLKWWWWWKWK", "KWLLWWWWWWWK",
    ".KWWWWWLLWK.", ".KWWWWWWWWK.", "..KKWWWWKK..", "....KKKK....",
  ],
  { W: "#FFF8EC", L: "#B9A7F0" },
);

export const EGG_CRACKED_2 = sprite(
  [
    "....KKKK....", "...KWWKWK...", "..KWWKWWWK..", ".KWWLKWWKWK.", ".KWKLKWWKWK.",
    "KWWKWWKWLKWK", "KWWWKWKKLLWK", "KWWKWWWWKWWK", "KWLKWWKWWKWK", "KWLLWKWKWWWK",
    ".KWWWWKLLWK.", ".KWWWWWWWWK.", "..KKWWWWKK..", "....KKKK....",
  ],
  { W: "#FFF8EC", L: "#B9A7F0" },
);

export const RICE_BALL = sprite(
  ["...KK...", "..KWWK..", ".KWWWWK.", ".KWWWWK.", "KWWWWWWK", "KDDDDDDK", "KDDDDDDK", ".KKKKKK."],
  { D: "#2F4F3A" },
);

export const RICE_BALL_BITTEN = sprite(
  ["........", "........", "......K.", ".KWWWWK.", "KWWWWWWK", "KDDDDDDK", "KDDDDDDK", ".KKKKKK."],
  { D: "#2F4F3A" },
);

export const BALL = sprite(
  ["..KKKK..", ".KRRYYK.", "KRRRYYYK", "KRRRYYYK", "KBBBWWWK", "KBBBWWWK", ".KBBWWK.", "..KKKK.."],
  { R: "#FF6B8B", Y: "#FFD24D", B: "#6FB7F0" },
);

export const HEART = sprite([".R.R.", "RRRRR", "RRRRR", ".RRR.", "..R.."], { R: "#FF6B8B" });

export const TEAR = sprite([".B.", "BBB", "BBB", ".B."], { B: "#6FB7F0" });

export const SPARKLE = sprite(["..Y..", "..Y..", "YYWYY", "..Y..", "..Y.."], { Y: "#FFD24D" });

export const BOOK = sprite(
  ["KKKKKKKK", "KBBBKBBK", "KBWBKBWK", "KBWBKBWK", "KBBBKBBK", "KKKKKKKK"],
  { B: "#6F9BE0" },
);

export const BOLT = sprite(
  ["..KKK", ".KYYK", "KYYK.", "KKYYK", ".KYK.", "KYK..", "KK..."],
  { Y: "#FFD24D" },
);

/** Same sprite drawn as an empty slot (for meters). */
export function emptyOf(s: Sprite): Sprite {
  const palette: Record<string, string> = {};
  for (const k of Object.keys(s.palette)) palette[k] = k === "K" ? "#C9C0E6" : "#EEE9FA";
  return { grid: s.grid, palette };
}

export const Z = sprite(["KKKK", "..K.", ".K..", "KKKK"]);


export { INK };
