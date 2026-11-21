import { useMemo, useState } from "react";
import {
  RL_ACTIONS, RL_PARAMS, REWARD, applyReward, contextFrom, describeContext, freshRL, pickAction, type RLState,
} from "../game/rl";

/** "How it learns": a sandbox brain you can poke, plus a fast-forward that trains one on a pretend owner. */

const TIMES = ["Night", "Morning", "Afternoon", "Evening"];
const LABEL: Record<string, string> = { feed: "Feed", play: "Play", rest: "Rest", chat: "Chat" };

type Habit = { id: string; name: string; prefers: (time: number, hungry: boolean, tired: boolean) => number };
const HABITS: Habit[] = [
  {
    id: "routine",
    name: "Feeds it in the morning, plays in the evening",
    prefers: (t, hungry, tired) => (hungry ? 0 : tired ? 2 : t === 1 ? 0 : t === 3 ? 1 : t === 0 ? 2 : 3),
  },
  {
    id: "owl",
    name: "Night owl gamer",
    prefers: (t, hungry) => (hungry ? 0 : t === 0 || t === 3 ? 1 : 2),
  },
  {
    id: "chatty",
    name: "Chatterbox",
    prefers: (_t, hungry, tired) => (hungry ? 0 : tired ? 2 : 3),
  },
];

const f2 = (n: number) => (n >= 0 ? "" : "") + n.toFixed(2);

type LastStep = { context: number; action: number; reward: number; before: number; after: number };

export function RLExplainer() {
  const [brain, setBrain] = useState<RLState>(freshRL);
  const [time, setTime] = useState(2);
  const [hungry, setHungry] = useState(false);
  const [tired, setTired] = useState(false);
  const [sad, setSad] = useState(false);
  const [ask, setAsk] = useState<{ action: number; explored: boolean } | null>(null);
  const [last, setLast] = useState<LastStep | null>(null);
  const [habit, setHabit] = useState(HABITS[0].id);
  const [curve, setCurve] = useState<number[]>([]);

  const context = contextFrom(time, hungry, tired, sad);
  const values = brain.q[context];

  const suggestNow = () => {
    setAsk(pickAction(brain, context));
    setLast(null);
  };

  const respond = (reward: number) => {
    if (!ask) return;
    const before = brain.q[context][ask.action];
    const next = applyReward(brain, context, ask.action, reward);
    setBrain(next);
    setLast({ context, action: ask.action, reward, before, after: next.q[context][ask.action] });
    setAsk(null);
  };

  const fastForward = () => {
    const h = HABITS.find((x) => x.id === habit)!;
    let b = brain;
    const rewards: number[] = [];
    for (let i = 0; i < 300; i++) {
      const t = Math.floor(Math.random() * 4);
      const hu = Math.random() < 0.25;
      const ti = Math.random() < 0.2;
      const sa = Math.random() < 0.2;
      const ctx = contextFrom(t, hu, ti, sa);
      const { action } = pickAction(b, ctx);
      const wanted = h.prefers(t, hu, ti);
      const r = action === wanted ? REWARD.followed : Math.random() < 0.8 ? REWARD.different : REWARD.ignored;
      b = applyReward(b, ctx, action, r);
      rewards.push(r);
    }
    // moving average of reward so the curve is readable
    const avg = rewards.map((_, i) => {
      const w = rewards.slice(Math.max(0, i - 24), i + 1);
      return w.reduce((a, c) => a + c, 0) / w.length;
    });
    setBrain(b);
    setCurve(avg);
    setAsk(null);
    setLast(null);
  };

  const reset = () => {
    setBrain(freshRL());
    setCurve([]);
    setAsk(null);
    setLast(null);
  };

  const learned = useMemo(
    () =>
      TIMES.map((name, t) => {
        const row = brain.q[contextFrom(t, false, false, false)];
        const best = row.reduce((bi, v, i) => (v > row[bi] ? i : bi), 0);
        return { name, best: row[best] > 0.05 ? LABEL[RL_ACTIONS[best]] : "?" };
      }),
    [brain],
  );

  const path = curve.length
    ? curve.map((v, i) => `${i ? "L" : "M"}${(i / (curve.length - 1)) * 300} ${40 - v * 36}`).join("")
    : "";

  return (
    <section className="rl-explainer" id="how-it-learns">
      <div className="section-head">
        <span className="eyebrow pixel">UNDER THE HOOD</span>
        <h2>How your pet learns you</h2>
        <p className="muted">
          It uses reinforcement learning: it tries things, sees how you react, and gets better at guessing what you want.
          Here's a practice brain to play with. It's separate from your real pet.
        </p>
      </div>

      <ol className="rl-steps">
        <li>
          <span className="pixel">1. SITUATION</span>
          <p>It notices the time of day and whether it's hungry, tired or sad. That's 32 possible situations.</p>
        </li>
        <li>
          <span className="pixel">2. SUGGESTION</span>
          <p>
            It suggests feed, play, rest or chat. Usually its best guess, but {Math.round(RL_PARAMS.epsilonStart * 100)}% of the
            time at first it explores something random.
          </p>
        </li>
        <li>
          <span className="pixel">3. REWARD</span>
          <p>
            You follow it (+1), do something else (-0.25) or ignore it (-0.5). It nudges its score for that suggestion towards
            the reward.
          </p>
        </li>
      </ol>

      <div className="rl-lab">
        <div className="card lab-try">
          <h3>Try it</h3>
          <div className="lab-row">
            <span className="stat-label">TIME</span>
            {TIMES.map((t, i) => (
              <button key={t} type="button" className={`chip ${time === i ? "active" : ""}`} onClick={() => { setTime(i); setAsk(null); }}>
                {t}
              </button>
            ))}
          </div>
          <div className="lab-row">
            <span className="stat-label">FEELS</span>
            <button type="button" className={`chip ${hungry ? "active" : ""}`} onClick={() => { setHungry(!hungry); setAsk(null); }}>hungry</button>
            <button type="button" className={`chip ${tired ? "active" : ""}`} onClick={() => { setTired(!tired); setAsk(null); }}>tired</button>
            <button type="button" className={`chip ${sad ? "active" : ""}`} onClick={() => { setSad(!sad); setAsk(null); }}>sad</button>
          </div>

          <div className="q-bars" aria-label={`Scores for ${describeContext(context).join(", ")}`}>
            {RL_ACTIONS.map((a, i) => {
              const v = values[i];
              return (
                <div key={a} className={`q-row ${ask?.action === i ? "pending" : ""} ${last?.action === i && last.context === context ? "just" : ""}`}>
                  <span className="q-label">{LABEL[a]}</span>
                  <span className="q-track">
                    <span className="q-zero" />
                    <i className={v >= 0 ? "pos" : "neg"} style={{ width: `${Math.min(50, Math.abs(v) * 50)}%`, [v >= 0 ? "left" : "right"]: "50%" }} />
                  </span>
                  <span className="q-num">{f2(v)}</span>
                </div>
              );
            })}
          </div>

          {!ask ? (
            <button type="button" className="pixel-btn" onClick={suggestNow}>ASK FOR A SUGGESTION</button>
          ) : (
            <div className="lab-ask">
              <p>
                It suggests <b>{LABEL[RL_ACTIONS[ask.action]]}</b>{" "}
                <span className="muted">({ask.explored ? "exploring: random pick" : "its best guess"})</span>
              </p>
              <div className="row-gap">
                <button type="button" className="pixel-btn" onClick={() => respond(REWARD.followed)}>FOLLOW IT +1</button>
                <button type="button" className="pixel-btn plain" onClick={() => respond(REWARD.different)}>DO SOMETHING ELSE -0.25</button>
                <button type="button" className="pixel-btn plain" onClick={() => respond(REWARD.ignored)}>IGNORE -0.5</button>
              </div>
            </div>
          )}

          <div className="lab-maths" aria-live="polite">
            {last ? (
              <>
                <span className="pixel">UPDATE</span>
                <code>
                  Q = {f2(last.before)} + {RL_PARAMS.alpha} × ({last.reward} − {f2(last.before)}) = <b>{f2(last.after)}</b>
                </code>
              </>
            ) : (
              <>
                <span className="pixel">RULE</span>
                <code>Q ← Q + α × (reward − Q), α = {RL_PARAMS.alpha}</code>
              </>
            )}
          </div>
          <p className="muted small">
            Explore rate now: {Math.round(brain.epsilon * 100)}% (shrinks each time, down to {Math.round(RL_PARAMS.epsilonMin * 100)}%).
            Suggestions learned from: {brain.episodes}.
          </p>
        </div>

        <div className="card lab-ff">
          <h3>Fast-forward</h3>
          <p className="muted">Pretend an owner with a routine looks after it for 300 suggestions.</p>
          <div className="lab-col">
            {HABITS.map((h) => (
              <label key={h.id} className="toggle">
                <input type="radio" name="habit" checked={habit === h.id} onChange={() => setHabit(h.id)} />
                <span>{h.name}</span>
              </label>
            ))}
          </div>
          <div className="row-gap">
            <button type="button" className="pixel-btn" onClick={fastForward}>RUN 300 STEPS</button>
            <button type="button" className="pixel-btn plain" onClick={reset}>RESET</button>
          </div>

          <svg className="lab-chart" viewBox="0 0 300 80" preserveAspectRatio="none" aria-label="Average reward over time">
            <line x1="0" x2="300" y1="40" y2="40" className="zero" />
            {path && <path d={path} />}
          </svg>
          <p className="muted small">
            {curve.length
              ? `Average reward went from ${curve[0].toFixed(2)} to ${curve[curve.length - 1].toFixed(2)} as it learned.`
              : "Average reward over time shows up here."}
          </p>

          <div className="lab-learned">
            <span className="pixel">WHAT IT LEARNED (WHEN CONTENT)</span>
            <div className="learned-grid">
              {learned.map((l) => (
                <div key={l.name}>
                  <span>{l.name}</span>
                  <b>{l.best}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="muted center small">
        Your real pet does exactly this in the background: a suggestion every 45 seconds (12 with demo speed on). Open
        Stats on the shell to see its live brain.
      </p>
    </section>
  );
}
