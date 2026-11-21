import { hourLabel, peakHour, periodOf, totalHabits, type Habits } from "../game/clock";
import { RL_ACTIONS } from "../game/rl";

const LABEL: Record<string, string> = { feed: "Feed", play: "Play", rest: "Rest", chat: "Chat" };
const COLOUR: Record<string, string> = { feed: "#FFB38A", play: "#FFB13D", rest: "#6F9BE0", chat: "#F583B4" };
const VERB: Record<string, string> = { feed: "feed it", play: "play", rest: "put it to bed", chat: "chat" };

/** 24-hour habit chart: when you usually do each thing, from the real clock. */
export function HabitCard({ habits, now, petName }: { habits: Habits; now: Date; petName: string }) {
  const hour = now.getHours();
  const max = Math.max(1, ...RL_ACTIONS.flatMap((a) => habits[a]));
  const lines = RL_ACTIONS.map((a) => {
    const p = peakHour(habits, a);
    return p === null ? null : `You usually ${VERB[a]} around ${hourLabel(p)}.`;
  }).filter(Boolean) as string[];

  return (
    <section className="card habit-card" aria-label="Your habits">
      <div className="card-head">
        <h3>Your habits</h3>
        <span className="pill pixel">
          {String(hour).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")} {periodOf(now).toUpperCase()}
        </span>
      </div>
      <p className="muted">
        {petName || "Your pet"} logs the real time every time you do something. The brain uses the time of day as part of the
        situation, so it learns your routine.
      </p>
      <div className="habit-grid" role="table" aria-label="Actions by hour of day">
        {RL_ACTIONS.map((a) => (
          <div key={a} className="habit-row" role="row">
            <span className="habit-label" role="rowheader">{LABEL[a]}</span>
            <span className="habit-cells">
              {habits[a].map((n, h) => (
                <i
                  key={h}
                  role="cell"
                  title={`${LABEL[a]} at ${hourLabel(h)}: ${n}`}
                  className={h === hour ? "now" : ""}
                  style={{ background: n ? COLOUR[a] : undefined, opacity: n ? 0.3 + (0.7 * n) / max : 1 }}
                />
              ))}
            </span>
          </div>
        ))}
        <div className="habit-row axis" aria-hidden="true">
          <span className="habit-label" />
          <span className="habit-cells">
            {Array.from({ length: 24 }, (_, h) => (
              <b key={h}>{h % 6 === 0 ? h : ""}</b>
            ))}
          </span>
        </div>
      </div>
      <p className="brain-note">
        <span className="pixel">ROUTINE</span>{" "}
        {totalHabits(habits) === 0 ? "Nothing logged yet. Look after it and your routine shows up here." : lines.length ? lines.join(" ") : "Still learning when you do things."}
      </p>
    </section>
  );
}
