import { useEffect, useRef, useState } from "react";
import {
  advanceStudyTimer,
  createStudyTimer,
  pauseStudyTimer,
  resetStudyTimer,
  resumeStudyTimer,
  startStudyTimer,
  STUDY_PRESETS,
  formatStudyTimerDisplay,
  type StudyTimer as StudyTimerState,
} from "../game/studyTimer";

export function StudyTimer({ onComplete }: { onComplete: (timer: StudyTimerState) => void }) {
  const [timer, setTimer] = useState<StudyTimerState>(() => createStudyTimer({ durationMs: STUDY_PRESETS[0].durationMs }));
  const timerRef = useRef(timer);
  const doneRef = useRef(onComplete);

  useEffect(() => {
    doneRef.current = onComplete;
  }, [onComplete]);

  const setCurrentTimer = (next: StudyTimerState) => {
    timerRef.current = next;
    setTimer(next);
  };

  const advance = () => {
    const next = advanceStudyTimer(timerRef.current);
    if (next.status === "completed" && !next.rewarded) {
      setCurrentTimer({ ...next, rewarded: true });
      doneRef.current(next);
      return;
    }
    setCurrentTimer(next);
  };

  useEffect(() => {
    if (timer.status !== "running") return;
    const id = window.setInterval(advance, 250);
    const onVisibilityChange = () => advance();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [timer.status]);

  const choose = (durationMs: number) => {
    setCurrentTimer(createStudyTimer({ durationMs }));
  };

  const toggle = () => {
    const current = timerRef.current;
    if (current.status === "ready") setCurrentTimer(startStudyTimer(current));
    else if (current.status === "running") setCurrentTimer(pauseStudyTimer(current));
    else if (current.status === "paused") setCurrentTimer(resumeStudyTimer(current));
  };

  const total = timer.durationMs;
  const done = timer.status === "completed";
  const running = timer.status === "running";

  return (
    <div className="timer">
      <div className="preset-row">
        {STUDY_PRESETS.map((p) => (
          <button key={p.label} type="button" className={`chip ${total === p.durationMs ? "active" : ""}`} onClick={() => choose(p.durationMs)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="timer-display" style={{ ["--p" as string]: `${((total - timer.remainingMs) / total) * 100}%` }}>
        {formatStudyTimerDisplay(timer.remainingMs)}
      </div>
      {done ? (
        <div className="row-gap">
          <span className="good">Focus complete! +Curiosity</span>
          <button type="button" className="btn btn-secondary small" onClick={() => setCurrentTimer(resetStudyTimer(timerRef.current))}>Again</button>
        </div>
      ) : (
        <div className="row-gap">
          <button type="button" className="btn btn-primary small" onClick={toggle}>
            {running ? "Pause" : timer.status === "ready" ? "Start focus" : "Resume"}
          </button>
          {timer.status !== "ready" && (
            <button type="button" className="btn btn-secondary small" onClick={() => setCurrentTimer(resetStudyTimer(timerRef.current))}>
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}
