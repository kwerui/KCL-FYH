/** Shell skins, matching the Figma "Shell Colours & Patterns" section. */

export type PatternKind =
  | "dots" | "stripes" | "checker" | "stars" | "hearts" | "gingham" | "confetti" | "clouds" | "wave" | "pixel";

export type Skin = {
  id: string;
  name: string;
  gradient: string[]; // top to bottom (or diagonal for holo)
  edge: string;
  pattern?: { kind: PatternKind; color: string; opacity: number };
  holo?: boolean;
  clear?: { color: string; opacity: number };
};

export const SKINS: Skin[] = [
  { id: "lilac", name: "Lilac", gradient: ["#D3C6F8", "#9580E3"], edge: "#7A66C9" },
  { id: "cherry", name: "Cherry", gradient: ["#FF9A9A", "#E04B5A"], edge: "#B23246" },
  { id: "tangerine", name: "Tangerine", gradient: ["#FFC58A", "#F58A3C"], edge: "#C2622A" },
  { id: "butter", name: "Butter", gradient: ["#FFF1A8", "#F5D45A"], edge: "#C9A62E" },
  { id: "matcha", name: "Matcha", gradient: ["#D6EBB0", "#93BF5E"], edge: "#6A923D" },
  { id: "ocean", name: "Ocean", gradient: ["#9ED8F5", "#3E95D6"], edge: "#2B6FA6" },
  { id: "grape", name: "Grape", gradient: ["#C8A6F0", "#8358C9"], edge: "#5E3C9C" },
  { id: "bubblegum", name: "Bubblegum", gradient: ["#FFC4DE", "#F583B4"], edge: "#C95A8A" },
  { id: "charcoal", name: "Charcoal", gradient: ["#6E6A78", "#33303C"], edge: "#1E1C24" },
  { id: "cream", name: "Cream", gradient: ["#FFF8EA", "#EADDC2"], edge: "#BFAE8C" },
  { id: "mint-polka", name: "Mint Polka", gradient: ["#C8F0DE", "#86D6B3"], edge: "#4FA07E", pattern: { kind: "dots", color: "#FFFFFF", opacity: 0.85 } },
  { id: "lemon-stripe", name: "Lemon Stripe", gradient: ["#FFF3B0", "#FFD95A"], edge: "#C9A62E", pattern: { kind: "stripes", color: "#FFFFFF", opacity: 0.6 } },
  { id: "lilac-check", name: "Lilac Check", gradient: ["#D9CCFA", "#A894EE"], edge: "#7A66C9", pattern: { kind: "checker", color: "#FFFFFF", opacity: 0.35 } },
  { id: "starry-night", name: "Starry Night", gradient: ["#4B5BA8", "#232B5E"], edge: "#161C40", pattern: { kind: "stars", color: "#FFE27A", opacity: 1 } },
  { id: "sweetheart", name: "Sweetheart", gradient: ["#FFD1E3", "#F59AC0"], edge: "#D06A96", pattern: { kind: "hearts", color: "#FFFFFF", opacity: 0.8 } },
  { id: "gingham", name: "Picnic Gingham", gradient: ["#F4F8FF", "#DCE8FB"], edge: "#6F93C9", pattern: { kind: "gingham", color: "#6F9BE0", opacity: 0.35 } },
  { id: "confetti", name: "Confetti", gradient: ["#FFF8EC", "#F3E6CC"], edge: "#C4AE86", pattern: { kind: "confetti", color: "#000000", opacity: 1 } },
  { id: "cloudy-sky", name: "Cloudy Sky", gradient: ["#BDE4FF", "#78B9EE"], edge: "#4F8CC4", pattern: { kind: "clouds", color: "#FFFFFF", opacity: 0.9 } },
  { id: "sunset-wave", name: "Sunset Wave", gradient: ["#FFE0C2", "#FFC08F"], edge: "#C55A48", pattern: { kind: "wave", color: "#F27D6B", opacity: 1 } },
  { id: "retro-pixel", name: "Retro Pixel", gradient: ["#CFCFD8", "#9E9EAE"], edge: "#6B6B7A", pattern: { kind: "pixel", color: "#FFFFFF", opacity: 0.3 } },
  { id: "holo", name: "Holo", gradient: ["#FFD1E8", "#D1E4FF", "#D1FFF0", "#FFF6C8", "#E8D1FF"], edge: "#A99BD9", holo: true },
  { id: "clear-aqua", name: "Clear Aqua", gradient: ["#7FD8E8", "#7FD8E8"], edge: "#4FB0C4", clear: { color: "#7FD8E8", opacity: 0.42 } },
  { id: "clear-smoke", name: "Clear Smoke", gradient: ["#5A5868", "#5A5868"], edge: "#3A3846", clear: { color: "#5A5868", opacity: 0.42 } },
];

export const DEFAULT_SKIN = SKINS[0];
export const skinById = (id: string) => SKINS.find((s) => s.id === id) ?? DEFAULT_SKIN;

const SKIN_KEY = "tama_skin";
export function loadSkinId(): string {
  try {
    return localStorage.getItem(SKIN_KEY) ?? DEFAULT_SKIN.id;
  } catch {
    return DEFAULT_SKIN.id;
  }
}
export function saveSkinId(id: string) {
  try {
    localStorage.setItem(SKIN_KEY, id);
  } catch {
    /* ignore */
  }
}

/** Seeded RNG so star/confetti layouts are identical on every render. */
export function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}
