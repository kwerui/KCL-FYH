/**
 * The nine original pixel pets (16x16), same art as the Figma "Pixel Pets" section.
 * '.' is transparent. K outline, W white, P blush; other letters are per-pet colours.
 * blink: cells that turn into `blinkWith` for a frame so the pet blinks.
 */

export type PixelGrid = string[];
export type Palette = Record<string, string>;

export const INK = "#3B2F4A";
export const BASE: Palette = { K: INK, W: "#FFFFFF", P: "#F7A6B9" };

export type Species = {
  id: SpeciesId;
  name: string;
  blurb: string;
  palette: Palette;
  grid: PixelGrid;
  blink: [number, number][];
  blinkWith: string;
  accent: string;
};

export const SPECIES_IDS = [
  "nimbu",
  "shroomi",
  "mothie",
  "jelli",
  "pebbl",
  "toasty",
  "bubbo",
  "peachi",
  "twinkle",
] as const;
export type SpeciesId = (typeof SPECIES_IDS)[number];

export const SPECIES: Record<SpeciesId, Species> = {
  nimbu: {
    id: "nimbu",
    name: "Nimbu",
    blurb: "A sleepy little cloud. Always drifting off.",
    accent: "#7FB8F0",
    palette: {},
    blink: [],
    blinkWith: "W",
    grid: [
      "................", "................", "................",
      ".....KKKK.......", "....KWWWWK.KK...", "..KKWWWWWWKWWK..", ".KWWWWWWWWWWWWK.",
      "KWWWWWWWWWWWWWWK", "KWWWKKWWWWKKWWWK", "KWWPPWWWWWWPPWWK", "KWWWWWWKKWWWWWWK",
      ".KWWWWWWWWWWWWK.", "..KKWWKKKKWWKK..", "....KK....KK....", "................", "................",
    ],
  },
  shroomi: {
    id: "shroomi",
    name: "Shroomi",
    blurb: "A spotty mushroom with big opinions.",
    accent: "#E8545B",
    palette: { R: "#E8545B", C: "#FFF1D6" },
    blink: [[5, 10], [10, 10]],
    blinkWith: "C",
    grid: [
      "................", ".....KKKKKK.....", "...KKRRRRRRKK...", "..KRRWWRRRRRRK..",
      ".KRRWWRRRRWWRRK.", ".KRRRRRRRRWWRRK.", "KRRRRRWWRRRRRRRK", "KRRRRRRRRRRRRRRK",
      ".KKKKKKKKKKKKKK.", "...KCCCCCCCCK...", "...KCKCCCCKCK...", "...KCPCKKCPCK...",
      "...KCCCCCCCCK...", "...KCCCCCCCCK...", "....KKKKKKKK....", "................",
    ],
  },
  mothie: {
    id: "mothie",
    name: "Mothie",
    blurb: "A fluffy moth who loves the glow of your screen.",
    accent: "#9580E3",
    palette: { L: "#C9B6F2", F: "#FFF4DE" },
    blink: [[6, 6], [9, 6]],
    blinkWith: "F",
    grid: [
      "..K..........K..", "...K........K...", "....K......K....", ".KK..KKKKKK..KK.",
      "KLLK.KFFFFK.KLLK", "KLLLKFFFFFFKLLLK", "KLLLKFKFFKFKLLLK", "KLLLKFPFFPFKLLLK",
      ".KLLKFFKKFFKLLK.", "..KKKFFFFFFKKK..", ".KLLKFFFFFFKLLK.", "KLLLKFFFFFFKLLLK",
      "KLLK.KFFFFK.KLLK", ".KK...KKKK...KK.", "................", "................",
    ],
  },
  jelli: {
    id: "jelli",
    name: "Jelli",
    blurb: "A wobbly jelly blob. Shiny and squishy.",
    accent: "#4FC79F",
    palette: { M: "#8FE3C6" },
    blink: [[5, 8], [10, 8]],
    blinkWith: "M",
    grid: [
      "................", "................", "................", "......KKKK......",
      "....KKMMMMKK....", "...KMWWMMMMMK...", "..KMWWMMMMMMMK..", "..KMWMMMMMMMMK..",
      ".KMMMKMMMMKMMMK.", ".KMMMKMMMMKMMMK.", ".KMMPMMKKMMPMMK.", ".KMMMMMMMMMMMMK.",
      "KMMMMMMMMMMMMMMK", "KMMMMMMMMMMMMMMK", ".KKKKKKKKKKKKKK.", "................",
    ],
  },
  pebbl: {
    id: "pebbl",
    name: "Pebbl",
    blurb: "A pebble growing a tiny sprout. Very patient.",
    accent: "#7CC46A",
    palette: { G: "#7CC46A", S: "#B9B7C2" },
    blink: [[4, 8], [11, 8]],
    blinkWith: "S",
    grid: [
      "...KK.....KK....", "..KGGK...KGGK...", "..KGGGK.KGGGK...", "...KKGGKGGKK....",
      "......KGK.......", "....KKKKKKKK....", "..KKSSSSSSSSKK..", ".KSSSSSSSSSSSSK.",
      ".KSSKSSSSSSKSSK.", "KSSSKSSSSSSKSSSK", "KSSPSSSKKSSSPSSK", "KSSSSSSSSSSSSSSK",
      "KSSSSSSSSSSSSSSK", ".KSSSSSSSSSSSSK.", "..KKKKKKKKKKKK..", "................",
    ],
  },
  toasty: {
    id: "toasty",
    name: "Toasty",
    blurb: "A warm slice of toast. Crunchy outside, soft inside.",
    accent: "#C98A4B",
    palette: { B: "#C98A4B", T: "#FBE3B0" },
    blink: [[5, 6], [10, 6]],
    blinkWith: "T",
    grid: [
      "................", "...KKKK..KKKK...", "..KBBBBKKBBBBK..", ".KBTTTTBBTTTTBK.",
      ".KBTTTTTTTTTTBK.", "..KBTTTTTTTTBK..", "..KBTKTTTTKTBK..", "..KBTKTTTTKTBK..",
      "..KBPTTKKTTPBK..", "..KBTTTTTTTTBK..", "..KBTTTTTTTTBK..", "..KBTTTTTTTTBK..",
      "..KBBBBBBBBBBK..", "...KKKKKKKKKK...", "................", "................",
    ],
  },
  bubbo: {
    id: "bubbo",
    name: "Bubbo",
    blurb: "A shy little ghost. Says boo very quietly.",
    accent: "#5B6FC4",
    palette: { B: "#D9ECFF" },
    blink: [[6, 5], [9, 5]],
    blinkWith: "B",
    grid: [
      "................", ".....KKKKKK.....", "....KBBBBBBK....", "...KBWBBBBBBK...",
      "..KBWBBBBBBBBK..", "..KBBBKBBKBBBK..", "..KBBBKBBKBBBK..", "..KBBPBBBBPBBK..",
      "..KBBBBKKBBBBK..", ".KBBBBBBBBBBBBK.", "..KBBBBBBBBBBK..", "..KBBBBBBBBBBK..",
      "..KBBBKBBKBBBK..", "...KKK.KK.KKK...", "................", "................",
    ],
  },
  peachi: {
    id: "peachi",
    name: "Peachi",
    blurb: "A juicy peach with a leafy hat.",
    accent: "#FF9A6B",
    palette: { G: "#6DBA5A", O: "#FFB38A", W: "#FFE3D1", P: "#F27D9B" },
    blink: [[5, 6], [10, 6]],
    blinkWith: "O",
    grid: [
      ".......KKK......", "......KGGGK.....", "....KKKKKKKK....", "...KOOOOKOOOK...",
      "..KOWOOOKOOOOK..", ".KOWOOOOOOOOOOK.", ".KOOOKOOOOKOOOK.", ".KOOOKOOOOKOOOK.",
      ".KOOPOOKKOOPOOK.", ".KOOOOOOOOOOOOK.", ".KOOOOOOOOOOOOK.", "..KOOOOOOOOOOK..",
      "...KKOOOOOOKK...", ".....KKKKKK.....", "................", "................",
    ],
  },
  twinkle: {
    id: "twinkle",
    name: "Twinkle",
    blurb: "A tiny star who fell out of the sky.",
    accent: "#F5B800",
    palette: { Y: "#FFD84D" },
    blink: [[5, 6], [10, 6]],
    blinkWith: "Y",
    grid: [
      ".......KK.......", "......KYYK......", "......KYYK......", ".....KYYYYK.....",
      "KKKKKKYYYYKKKKKK", "KYYYYYYYYYYYYYYK", ".KYYYKYYYYKYYYK.", "..KYYKYYYYKYYK..",
      "...KYPYKKYPYK...", "...KYYYYYYYYK...", "..KYYYYYYYYYYK..", "..KYYYYKKYYYYK..",
      ".KYYYKK..KKYYYK.", ".KYKK......KKYK.", ".KK..........KK.", "................",
    ],
  },
};

export const ALL_SPECIES = SPECIES_IDS.map((id) => SPECIES[id]);

export function topRow(grid: PixelGrid): number {
  const i = grid.findIndex((row) => /[^.]/.test(row));
  return i < 0 ? 0 : i;
}

export function bottomRow(grid: PixelGrid): number {
  for (let i = grid.length - 1; i >= 0; i--) if (/[^.]/.test(grid[i])) return i;
  return grid.length - 1;
}
