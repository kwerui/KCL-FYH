/**
 * The pet's reinforcement learning brain.
 *
 * Problem: every so often the pet makes a suggestion ("feed me?", "play?",
 * "nap?", "talk to me?"). It wants to suggest whatever YOU actually tend to do
 * in that situation, so it learns your habits.
 *
 * This is a contextual bandit, i.e. one-step Q-learning (gamma = 0):
 *   context s : time of day (4) x hungry? x tired? x sad?  -> 32 contexts
 *   action  a : feed | play | rest | chat
 *   reward  r : +1   you did what it suggested within the window
 *               -0.25 you did something else instead
 *               -0.5 you ignored it until the window closed
 *   update    : Q(s,a) <- Q(s,a) + alpha * (r - Q(s,a))
 *   policy    : epsilon-greedy, epsilon decays as it gains experience
 *
 * Each suggestion is its own one-step episode, so there is no next state to
 * bootstrap from (that was the bug in the old gamma = 0.9 version: values kept
 * inflating whatever you did).
 *
 * It also learns by watching: when you care for it with no suggestion pending,
 * the action you chose gets a small "habit" reward in that context.
 */

export type RLAction = "feed" | "play" | "rest" | "chat";
export const RL_ACTIONS: RLAction[] = ["feed", "play", "rest", "chat"];

const N_CONTEXTS = 32;
const ALPHA = 0.25;
const HABIT_REWARD = 0.4;
const HABIT_ALPHA = 0.15;
const EPSILON_START = 0.35;
const EPSILON_MIN = 0.05;
const EPSILON_DECAY = 0.93;

export const REWARD = { followed: 1, different: -0.25, ignored: -0.5 } as const;

export type Pending = { context: number; action: number; at: number };

export type RLState = {
  version: 2;
  q: number[][]; // [context][action]
  visits: number[][];
  epsilon: number;
  episodes: number;
  pending: Pending | null;
  lastNudgeAt: number;
  rewards: number[]; // most recent first, capped
};

export type Needs = { hunger: number; energy: number; happiness: number };

const STORAGE_KEY = "tama_rl";
const zeros = () => Array.from({ length: N_CONTEXTS }, () => [0, 0, 0, 0]);

export function freshRL(): RLState {
  return {
    version: 2,
    q: zeros(),
    visits: zeros(),
    epsilon: EPSILON_START,
    episodes: 0,
    pending: null,
    lastNudgeAt: Date.now(),
    rewards: [],
  };
}

export function loadRLState(): RLState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 2 && Array.isArray(parsed.q)) {
        return { ...parsed, pending: null, lastNudgeAt: Date.now() } as RLState;
      }
    }
  } catch {
    /* corrupted or old format: start fresh */
  }
  return freshRL();
}

export function saveRLState(state: RLState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
}

export function clearRLState(): RLState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return freshRL();
}

const TIME_NAMES = ["Night", "Morning", "Afternoon", "Evening"];

export function contextOf(n: Needs, date = new Date()): number {
  const time = Math.floor(date.getHours() / 6); // 0 night, 1 morning, 2 afternoon, 3 evening
  const hungry = n.hunger > 60 ? 1 : 0;
  const tired = n.energy < 40 ? 1 : 0;
  const sad = n.happiness < 50 ? 1 : 0;
  return time * 8 + ((hungry << 2) | (tired << 1) | sad);
}

export function describeContext(context: number): string[] {
  const time = Math.floor(context / 8);
  const bits = context % 8;
  const tags = [TIME_NAMES[time]];
  if (bits & 4) tags.push("hungry");
  if (bits & 2) tags.push("tired");
  if (bits & 1) tags.push("sad");
  if (tags.length === 1) tags.push("content");
  return tags;
}

const argmax = (row: number[]) => row.reduce((best, v, i) => (v > row[best] ? i : best), 0);

function pushReward(rewards: number[], r: number) {
  return [r, ...rewards].slice(0, 24);
}

function learn(rl: RLState, context: number, action: number, reward: number, alpha = ALPHA): RLState {
  const q = rl.q.map((row) => [...row]);
  const visits = rl.visits.map((row) => [...row]);
  q[context][action] += alpha * (reward - q[context][action]);
  visits[context][action] += 1;
  return { ...rl, q, visits };
}

/** Pick a suggestion for the current situation (epsilon-greedy). */
export function suggest(rl: RLState, needs: Needs, now = Date.now()): { rl: RLState; action: RLAction; explored: boolean } {
  const context = contextOf(needs);
  const explored = Math.random() < rl.epsilon;
  const action = explored ? Math.floor(Math.random() * RL_ACTIONS.length) : argmax(rl.q[context]);
  return {
    rl: { ...rl, pending: { context, action, at: now }, lastNudgeAt: now },
    action: RL_ACTIONS[action],
    explored,
  };
}

function closeEpisode(rl: RLState, reward: number): RLState {
  if (!rl.pending) return rl;
  const learned = learn(rl, rl.pending.context, rl.pending.action, reward);
  return {
    ...learned,
    pending: null,
    episodes: rl.episodes + 1,
    epsilon: Math.max(EPSILON_MIN, rl.epsilon * EPSILON_DECAY),
    rewards: pushReward(rl.rewards, reward),
  };
}

/** You did something. Reward the pending suggestion, or learn the habit by watching. */
export function observe(rl: RLState, did: RLAction, needsBefore: Needs): { rl: RLState; reward: number | null } {
  const idx = RL_ACTIONS.indexOf(did);
  if (rl.pending) {
    const reward = idx === rl.pending.action ? REWARD.followed : REWARD.different;
    return { rl: closeEpisode(rl, reward), reward };
  }
  const context = contextOf(needsBefore);
  return { rl: learn(rl, context, idx, HABIT_REWARD, HABIT_ALPHA), reward: null };
}

/** The suggestion window closed with no response. */
export function expire(rl: RLState): RLState {
  return closeEpisode(rl, REWARD.ignored);
}

export function pendingAction(rl: RLState): RLAction | null {
  return rl.pending ? RL_ACTIONS[rl.pending.action] : null;
}

export function bestGuess(rl: RLState, needs: Needs): { context: number; values: number[]; best: RLAction } {
  const context = contextOf(needs);
  const values = rl.q[context];
  return { context, values, best: RL_ACTIONS[argmax(values)] };
}

export function averageReward(rl: RLState): number {
  if (!rl.rewards.length) return 0;
  return rl.rewards.reduce((a, b) => a + b, 0) / rl.rewards.length;
}

const NUDGES: Record<RLAction, string[]> = {
  feed: ["Snack time? You usually feed me about now.", "My tummy is rumbling. Food?", "Is it dinner yet?"],
  play: ["Play with me? You normally do around now!", "I have SO much energy. Game?", "Throw the ball! Please?"],
  rest: ["I'm yawning. Lights off for a bit?", "Nap time? You usually let me rest now.", "So sleepy..."],
  chat: ["Talk to me! How's your day?", "I missed you. What's new?", "Tell me something!"],
};

export function nudgeLine(action: RLAction, mode: string): string {
  if (action === "chat" && mode === "study") return "Study session? I'll ask you a question.";
  const lines = NUDGES[action];
  return lines[Math.floor(Math.random() * lines.length)];
}
