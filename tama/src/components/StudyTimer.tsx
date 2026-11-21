import { useEffect, useRef, useState } from "react";

const PRESETS = [
  { label: "10s demo", seconds: 10 },
  { label: "1 min", seconds: 60 },
  { label: "5 min", seconds: 300 },
];

export function StudyTimer({ onComplete }: { onComplete: () => void }) {
  const [total, setTotal] = useState(PRESETS[0].seconds);
  const [left, setLeft] = useState(PRESETS[0].seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          setDone(true);
          doneRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const choose = (secs: number) => {
    setTotal(secs);
    setLeft(secs);
    setRunning(false);
    setDone(false);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="timer">
      <div className="preset-row">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className={`chip ${total === p.seconds ? "active" : ""}`} onClick={() => choose(p.seconds)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="timer-display" style={{ ["--p" as string]: `${((total - left) / total) * 100}%` }}>
        {mm}:{ss}
      </div>
      {done ? (
        <div className="row-gap">
          <span className="good">Focus complete! +Curiosity</span>
          <button type="button" className="btn btn-secondary small" onClick={() => choose(total)}>Again</button>
        </div>
      ) : (
        <button type="button" className="btn btn-primary small" onClick={() => setRunning(!running)}>
          {running ? "Pause" : left === total ? "Start focus" : "Resume"}
        </button>
      )}
    </div>
  );
}
