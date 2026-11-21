/** Real-time clock helpers and the owner habit log (what you do, and at what hour). */

import type { RLAction } from "./rl";

export const BEDTIME = 22; // falls asleep at 22:00
export const WAKE_UP = 7; // wakes at 07:00

export const PERIODS = ["Night", "Morning", "Afternoon", "Evening"] as const;

export function periodOf(date = new Date()): (typeof PERIODS)[number] {
  return PERIODS[Math.floor(date.getHours() / 6)];
}

export function isNightTime(date = new Date()): boolean {
  const h = date.getHours();
  return h >= BEDTIME || h < WAKE_UP;
}

export function clockText(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function hourLabel(h: number): string {
  if (h === 0) return "midnight";
  if (h === 12) return "noon";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export function ageText(bornAt: number, now = Date.now()): string {
  const mins = Math.max(0, Math.floor((now - bornAt) / 60000));
  if (mins < 60) return `${mins} min old`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m old`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} old`;
}

// ---- Habit log: counts[action][hour] ----

export type Habits = Record<RLAction, number[]>;
const KEY = "tama_habits";
const empty = (): Habits => ({
  feed: Array(24).fill(0),
  play: Array(24).fill(0),
  rest: Array(24).fill(0),
  chat: Array(24).fill(0),
});

export function loadHabits(): Habits {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (raw && Array.isArray(raw.feed) && raw.feed.length === 24) return { ...empty(), ...raw };
  } catch {
    /* start fresh */
  }
  return empty();
}

export function saveHabits(h: Habits) {
  try {
    localStorage.setItem(KEY, JSON.stringify(h));
  } catch {
    /* ignore */
  }
}

export function clearHabits(): Habits {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return empty();
}

export function recordHabit(h: Habits, action: RLAction, date = new Date()): Habits {
  const next = { ...h, [action]: [...h[action]] };
  next[action][date.getHours()] += 1;
  return next;
}

/** Hour you most often do this, if you've done it at least twice. */
export function peakHour(h: Habits, action: RLAction): number | null {
  const row = h[action];
  let best = 0;
  for (let i = 1; i < 24; i++) if (row[i] > row[best]) best = i;
  return row[best] >= 2 ? best : null;
}

export function totalHabits(h: Habits): number {
  return (Object.values(h) as number[][]).reduce((a, row) => a + row.reduce((x, y) => x + y, 0), 0);
}
