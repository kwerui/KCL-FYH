/** Mode activities that work with zero network: jokes, guessing game, task breaker, revision questions. */

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const JOKES = [
  "Why did the pixel go to school? To get a little more resolution.",
  "I tried to eat a clock once. It was very time consuming.",
  "What do you call a sleepy egg? Eggs-hausted.",
  "My favourite exercise? Byte-ups.",
  "Why was the LCD screen so calm? It never lost its focus.",
  "I'm reading a book about anti-gravity. I can't put it down.",
  "Why did the robot go on holiday? It needed to recharge its batteries.",
  "What's a pet's favourite key on the keyboard? The pet-sc... no wait, escape.",
];

export const tellJoke = () => pick(JOKES);

export type GuessGame = { secret: number; tries: number; done: boolean };

export const newGuessGame = (): GuessGame => ({ secret: 1 + Math.floor(Math.random() * 10), tries: 0, done: false });

export function guess(game: GuessGame, n: number): { game: GuessGame; line: string; won: boolean } {
  const tries = game.tries + 1;
  if (n === game.secret) {
    return {
      game: { ...game, tries, done: true },
      line: tries === 1 ? `FIRST TRY?! It was ${n}! Are you psychic?!` : `YES! It was ${n}! Took you ${tries} goes.`,
      won: true,
    };
  }
  const hint = n < game.secret ? "Higher!" : "Lower!";
  const flavour = pick(["Nope!", "Not quite!", "Ooh, close-ish!", "Brrrp, wrong!"]);
  return { game: { ...game, tries }, line: `${flavour} ${hint}`, won: false };
}

/** Serious mode: break a task into three concrete steps, locally. */
export function breakTask(task: string): string {
  const clean = task
    .replace(/^(please\s+)?(help me\s+)?(to\s+)?(break down|break|plan)\s*(this|my)?\s*(task)?[:\s]*/i, "")
    .replace(/^(i (need|have|want) to|i should)\s+/i, "")
    .trim()
    .replace(/[.!?]+$/, "");
  const t = clean || "your task";
  return [
    `Step 1: Define done. Write one sentence for what "${t}" looks like when finished.`,
    `Step 2: Do the smallest first piece for 20 minutes. No polishing.`,
    `Step 3: Check what's left, then schedule the next block.`,
  ].join(" ");
}

export const QUIZ = [
  { q: "In reinforcement learning, what does epsilon control?", a: "how often the agent explores at random" },
  { q: "What does a Q-value estimate?", a: "the expected reward of an action in a state" },
  { q: "What is the derivative of x squared?", a: "2x" },
  { q: "What does CPU stand for?", a: "central processing unit" },
  { q: "Big-O of binary search?", a: "O(log n)" },
  { q: "Who wrote the 1950 paper 'Computing Machinery and Intelligence'?", a: "Alan Turing" },
  { q: "What is a tautology in logic?", a: "a statement true under every interpretation" },
  { q: "What does a learning rate (alpha) do?", a: "sets how far each update moves the estimate" },
];

export const quizQuestion = () => pick(QUIZ);

export function checkAnswer(answer: string, expected: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  const want = norm(expected);
  const got = new Set(norm(answer));
  if (!want.length) return false;
  const hits = want.filter((w) => got.has(w)).length;
  return hits / want.length >= 0.5 || answer.toLowerCase().replace(/\s/g, "") === expected.toLowerCase().replace(/\s/g, "");
}
