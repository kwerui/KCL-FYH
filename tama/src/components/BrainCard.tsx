import { RL_ACTIONS, averageReward, bestGuess, describeContext, pendingAction, type Needs, type RLState } from "../game/rl";

const LABEL: Record<string, string> = { feed: "Feed", play: "Play", rest: "Rest", chat: "Chat" };

export function BrainCard({
  rl,
  needs,
  petName,
  fast,
  setFast,
  onAskNow,
  lastOutcome,
  hatched,
}: {
  rl: RLState;
  needs: Needs;
  petName: string;
  fast: boolean;
  setFast: (b: boolean) => void;
  onAskNow: () => void;
  lastOutcome: string;
  hatched: boolean;
}) {
  const { context, values, best } = bestGuess(rl, needs);
  const pending = pendingAction(rl);
  const tags = describeContext(context);
  const avg = averageReward(rl);

  return (
    <section className="card brain-card" aria-label="Reinforcement learning brain">
      <div className="card-head">
        <h3>{petName ? `${petName}'s brain` : "The brain"}</h3>
        <span className="pill pixel">Q-LEARNING</span>
      </div>
      <p className="muted">
        It learns what <b>you</b> usually do in each situation, then suggests it. Follow a suggestion: +1. Do something else:
        -0.25. Ignore it: -0.5.
      </p>

      <div className="context-row" aria-label="Current situation">
        <span className="muted small">Right now:</span>
        {tags.map((t) => (
          <span key={t} className="chip static">{t}</span>
        ))}
      </div>

      <div className="q-bars" role="list" aria-label="Learned values for this situation">
        {RL_ACTIONS.map((a, i) => {
          const v = values[i];
          const w = Math.min(50, Math.abs(v) * 50);
          return (
            <div key={a} className={`q-row ${pending === a ? "pending" : ""} ${best === a && v > 0 ? "best" : ""}`} role="listitem">
              <span className="q-label">{LABEL[a]}</span>
              <span className="q-track">
                <span className="q-zero" />
                <i className={v >= 0 ? "pos" : "neg"} style={{ width: `${w}%`, [v >= 0 ? "left" : "right"]: "50%" }} />
              </span>
              <span className="q-num">{v.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      <div className="brain-stats">
        <div><b>{rl.episodes}</b><span>suggestions learned from</span></div>
        <div><b>{Math.round(rl.epsilon * 100)}%</b><span>explore rate</span></div>
        <div><b className={avg >= 0 ? "good" : "bad"}>{avg >= 0 ? "+" : ""}{avg.toFixed(2)}</b><span>avg reward</span></div>
      </div>

      <div className="reward-strip" aria-label="Recent rewards, newest first">
        {rl.rewards.length === 0 && <span className="muted small">No rewards yet.</span>}
        {rl.rewards.map((r, i) => (
          <i key={i} className={r > 0 ? "pos" : "neg"} style={{ height: `${Math.max(20, Math.abs(r) * 100)}%` }} title={r.toFixed(2)} />
        ))}
      </div>

      <p className="brain-outcome">{lastOutcome}</p>

      <div className="row-gap">
        <button type="button" className="btn btn-secondary small" onClick={onAskNow} disabled={!hatched || !!pending}>
          {pending ? `Waiting: suggested ${LABEL[pending]}` : "Make a suggestion now"}
        </button>
        <label className="toggle">
          <input type="checkbox" checked={fast} onChange={(e) => setFast(e.target.checked)} />
          <span>Demo speed</span>
        </label>
      </div>
    </section>
  );
}
