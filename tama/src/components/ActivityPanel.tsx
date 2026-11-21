import { useState } from "react";
import type { PetState } from "../game/petState";
import { MAX_FACTS } from "../game/petState";
import type { GuessGame } from "../game/activities";
import { StudyTimer } from "./StudyTimer";
import type { StudyTimer as StudyTimerState } from "../game/studyTimer";

type Props = {
  pet: PetState;
  game: GuessGame | null;
  quizActive: boolean;
  onJoke: () => void;
  onStartGame: () => void;
  onGuess: (n: number) => void;
  onBreakTask: (task: string) => void;
  onStudyDone: (timer: StudyTimerState) => void;
  onQuiz: () => void;
  onForget: (fact: string | null) => void;
  onPat: () => void;
  busy: boolean;
};

export function ActivityPanel(p: Props) {
  const [task, setTask] = useState("");
  const off = !p.pet.hatched;

  return (
    <section className={`card activity-card mode-${p.pet.mode}`} aria-label="Mode activity">
      {p.pet.mode === "silly" && (
        <>
          <h3>Silly time</h3>
          <p className="muted">Jokes and a tiny guessing game. Playing raises Playfulness.</p>
          <div className="row-gap">
            <button type="button" className="btn btn-secondary" onClick={p.onJoke} disabled={off}>Tell me a joke</button>
            <button type="button" className="btn btn-primary" onClick={p.onStartGame} disabled={off}>
              {p.game && !p.game.done ? "New number" : "Guess my number"}
            </button>
          </div>
          {p.game && !p.game.done && (
            <div className="guess-grid" aria-label="Guess a number from 1 to 10">
              {Array.from({ length: 10 }, (_, i) => (
                <button key={i} type="button" className="guess-btn" onClick={() => p.onGuess(i + 1)}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
          {p.game && <p className="muted small">Tries: {p.game.tries}{p.game.done ? " (solved!)" : ""}</p>}
        </>
      )}

      {p.pet.mode === "serious" && (
        <>
          <h3>Break it down</h3>
          <p className="muted">Give it a task and it splits it into 2 or 3 steps.</p>
          <form
            className="row-gap"
            onSubmit={(e) => {
              e.preventDefault();
              if (task.trim()) {
                p.onBreakTask(task.trim());
                setTask("");
              }
            }}
          >
            <input
              className="text-input"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. finish my Logic coursework"
              disabled={off || p.busy}
              maxLength={200}
            />
            <button type="submit" className="btn btn-primary" disabled={off || p.busy || !task.trim()}>Plan it</button>
          </form>
        </>
      )}

      {p.pet.mode === "study" && (
        <>
          <h3>Focus session</h3>
          <p className="muted">Finish a session to raise Curiosity. Or let it quiz you.</p>
          <StudyTimer onComplete={p.onStudyDone} />
          <button type="button" className="btn btn-secondary" onClick={p.onQuiz} disabled={off}>
            {p.quizActive ? "Another question" : "Quiz me"}
          </button>
          {p.quizActive && <p className="muted small">Type your answer in the chat.</p>}
        </>
      )}

      {p.pet.mode === "companion" && (
        <>
          <h3>Things it remembers</h3>
          <p className="muted">
            Only what you choose: press <b>Remember</b> on one of your messages. Up to {MAX_FACTS}. Nothing is sent anywhere
            except as context for replies, and no voice is recorded.
          </p>
          {p.pet.savedFacts.length === 0 ? (
            <p className="empty-note">Nothing saved yet.</p>
          ) : (
            <ul className="memory-list">
              {p.pet.savedFacts.map((f) => (
                <li key={f}>
                  <span>{f}</span>
                  <button type="button" className="link-btn" onClick={() => p.onForget(f)}>Forget</button>
                </li>
              ))}
            </ul>
          )}
          <div className="row-gap">
            <button type="button" className="btn btn-primary" onClick={p.onPat} disabled={off}>Give a pat</button>
            {p.pet.savedFacts.length > 0 && (
              <button type="button" className="link-btn danger" onClick={() => p.onForget(null)}>Forget everything</button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
