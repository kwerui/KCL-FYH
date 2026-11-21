import { useCallback, useEffect, useRef, useState } from "react";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/700.css";
import "@fontsource/pixelify-sans/400.css";
import "@fontsource/pixelify-sans/700.css";
import "./styles/retro.css";

import { generatePetReply } from "./ai/client";
import type { PetEmotion, PetMode } from "./ai/types";
import { SPECIES, SPECIES_IDS, type SpeciesId } from "./art/pets";
import { loadSkinId, saveSkinId, skinById } from "./art/skins";
import {
  breakTask, checkAnswer, guess, newGuessGame, quizQuestion, tellJoke, type GuessGame,
} from "./game/activities";
import { applyCareAction, applyConversationBonus, applyDelta, applyPassiveDecay, type CareAction } from "./game/careLogic";
import { FORM_INFO, type Trait } from "./game/evolutionLogic";
import { hatchPet, loadPetState, MAX_FACTS, resetPetState, savePetState, type PetState } from "./game/petState";
import { completeFrontendStudySession, type StudyTimer as StudyTimerState } from "./game/studyTimer";
import {
  RL_ACTIONS, bestGuess, clearRLState, describeContext, expire, loadRLState, nudgeLine, observe, pendingAction,
  saveRLState, suggest, type RLAction, type RLState,
} from "./game/rl";
import { useSpeech } from "../../src/voice/useSpeech";

import { ActivityPanel } from "./components/ActivityPanel";
import { BrainCard } from "./components/BrainCard";
import { Footer, Header, type Page } from "./components/Brand";
import { CareControls } from "./components/CareControls";
import { ChatPanel, type ChatMsg } from "./components/ChatPanel";
import { EvolutionCard } from "./components/EvolutionCard";
import { ShellGallery } from "./components/Galleries";
import { HomePage } from "./components/HomePage";
import { LcdScene, type Fx, type FxKind } from "./components/LcdScene";
import { MODES } from "./components/ModeSelector";
import { HatchCard, StatusMeters } from "./components/StatusMeters";
import { ICONS, TamagotchiShell, type IconId } from "./components/TamagotchiShell";

const TICK_MS = 1000;
const DECAY_MS = 30_000;
const TIMING = {
  normal: { nudgeEvery: 45_000, window: 30_000 },
  fast: { nudgeEvery: 12_000, window: 15_000 },
};
const ACTION_WORD: Record<RLAction, string> = { feed: "feed it", play: "play", rest: "let it rest", chat: "chat" };

let msgId = 1;

export default function App() {
  const [pet, setPet] = useState<PetState>(loadPetState);
  const [rl, setRl] = useState<RLState>(loadRLState);
  const [skinId, setSkinId] = useState(loadSkinId);
  const [emotion, setEmotion] = useState<PetEmotion>("happy");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fx, setFx] = useState<Fx | null>(null);
  const [view, setView] = useState<"pet" | "stats">("pet");
  const [selected, setSelected] = useState(0);
  const [line, setLine] = useState<string>("");
  const [fast, setFast] = useState(true);
  const [lastOutcome, setLastOutcome] = useState("Waiting for its first suggestion.");
  const [game, setGame] = useState<GuessGame | null>(null);
  const [quiz, setQuiz] = useState<{ q: string; a: string } | null>(null);
  const [hatchName, setHatchName] = useState("");
  const [hatchSpecies, setHatchSpecies] = useState<SpeciesId | "surprise">("surprise");
  const [hatching, setHatching] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState<Page>(() => (window.location.hash.startsWith("#/play") ? "play" : "home"));
  const scrollTarget = useRef<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const petRef = useRef(pet);
  petRef.current = pet;
  const rlRef = useRef(rl);
  rlRef.current = rl;
  const fastRef = useRef(fast);
  fastRef.current = fast;
  const lastDecay = useRef(Date.now());
  const lastPat = useRef(0);
  const emotionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevEvolution = useRef(pet.evolution);
  const sendMessageRef = useRef<(text: string) => void>(() => undefined);

  const onFinalTranscript = useCallback((text: string) => {
    sendMessageRef.current(text);
  }, []);
  const {
    isListening,
    isRecognitionSupported,
    recognisedText,
    error: speechError,
    startListening,
    stopListening,
    cancelListening,
    speak,
    cancelSpeech,
    isMuted,
    setMuted,
    clearError,
  } = useSpeech({ language: "en-GB", onFinalTranscript });
  const skin = skinById(skinId);

  useEffect(() => savePetState(pet), [pet]);
  useEffect(() => saveRLState(rl), [rl]);

  const playFx = useCallback((kind: FxKind) => setFx({ kind, id: Date.now() + Math.random() }), []);

  const feel = useCallback((e: PetEmotion, ms = 2600) => {
    setEmotion(e);
    if (emotionTimer.current) clearTimeout(emotionTimer.current);
    emotionTimer.current = setTimeout(() => setEmotion("happy"), ms);
  }, []);

  const petSays = useCallback(
    (text: string, opts: { chat?: boolean; voice?: boolean } = {}) => {
      setLine(text);
      if (opts.chat) setMessages((m) => [...m, { id: msgId++, role: "pet", text }]);
      if (opts.voice) speak(text);
    },
    [speak],
  );

  // Mood follows needs when nothing else is going on.
  useEffect(() => {
    if (emotionTimer.current) return;
    if (pet.hunger > 75) setEmotion("hungry");
    else if (pet.energy < 20) setEmotion("sleepy");
    else if (pet.happiness < 30) setEmotion("sad");
    else setEmotion("happy");
  }, [pet.hunger, pet.energy, pet.happiness]);

  // One ticker for time passing and the RL suggestion loop (refs avoid the old reset-every-render bug).
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const p = petRef.current;
      if (!p.hatched) return;

      if (now - lastDecay.current >= DECAY_MS) {
        lastDecay.current = now;
        setPet((s) => applyPassiveDecay(s));
      }

      const t = fastRef.current ? TIMING.fast : TIMING.normal;
      const brain = rlRef.current;
      if (brain.pending && now - brain.pending.at > t.window) {
        const missed = RL_ACTIONS[brain.pending.action];
        setRl(expire(brain));
        setLastOutcome(`-0.5: you didn't ${ACTION_WORD[missed]} after it asked. Noted.`);
        setLine("");
      } else if (!brain.pending && !p.asleep && now - brain.lastNudgeAt > t.nudgeEvery) {
        const s = suggest(brain, p);
        setRl(s.rl);
        setLine(nudgeLine(s.action, p.mode));
        setLastOutcome(
          s.explored
            ? `Exploring: trying "${s.action}" to see what you think.`
            : `Its best guess: you usually ${ACTION_WORD[s.action]} when it's ${describeContext(s.rl.pending!.context).join(", ").toLowerCase()}.`,
        );
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Evolution announcements.
  useEffect(() => {
    const prev = prevEvolution.current;
    prevEvolution.current = pet.evolution;
    if (prev === pet.evolution || !pet.hatched) return;
    if (pet.evolution === "egg" || pet.evolution === "hatchling") return;
    const msg = `${pet.petName} evolved into a ${FORM_INFO[pet.evolution].name}!`;
    playFx("evolve");
    feel("excited", 3000);
    petSays(msg, { chat: true, voice: true });
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, [pet.evolution, pet.hatched, pet.petName, playFx, feel, petSays]);

  /** Tell the brain what you did. */
  const teach = useCallback((did: RLAction) => {
    const before = petRef.current;
    const { rl: next, reward } = observe(rlRef.current, did, before);
    setRl(next);
    if (reward === null) setLastOutcome(`Habit noted: you chose to ${ACTION_WORD[did]} here.`);
    else if (reward > 0) setLastOutcome(`+1: you did what it suggested (${did}). It's learning!`);
    else setLastOutcome(`${reward}: it suggested something else, you chose ${did}.`);
    if (reward !== null) setLine("");
  }, []);

  const doCare = useCallback(
    (action: CareAction) => {
      const p = petRef.current;
      if (!p.hatched) return;
      if (action === "pat") {
        if (Date.now() - lastPat.current < 500) return;
        lastPat.current = Date.now();
        setPet((s) => applyCareAction(s, "pat"));
        playFx("pat");
        feel("happy");
        if (Math.random() < 0.35) petSays(["Hehe!", "More pats please.", "I like you.", "Purr..."][Math.floor(Math.random() * 4)]);
        return;
      }
      if (action === "rest" && p.asleep) {
        setPet((s) => ({ ...s, asleep: false }));
        petSays("Good morning!");
        return;
      }
      if (action === "feed" && p.hunger < 8) {
        feel("sad", 1500);
        petSays("I'm stuffed! No more.");
        teach("feed");
        return;
      }
      setPet((s) => applyCareAction(s, action));
      teach(action);
      playFx(action);
      if (action === "feed") feel("happy", 2800);
      if (action === "play") feel("excited", 2800);
      if (action === "rest") petSays("Night night...");
    },
    [feel, petSays, playFx, teach],
  );

  // ---- Hatching ----
  const hatch = useCallback(() => {
    const name = hatchName.trim();
    if (!name) {
      nameRef.current?.focus();
      setLine("Give me a name first!");
      return;
    }
    if (hatching) return;
    const species: SpeciesId =
      hatchSpecies === "surprise" ? SPECIES_IDS[Math.floor(Math.random() * SPECIES_IDS.length)] : hatchSpecies;
    setHatching(true);
    setTimeout(() => {
      setPet((s) => hatchPet(s, name, species));
      prevEvolution.current = "hatchling";
      setHatching(false);
      playFx("hatch");
      feel("excited", 3000);
      lastDecay.current = Date.now();
      setRl((r) => ({ ...r, lastNudgeAt: Date.now() }));
      const hello = `Hi! I'm ${name}, a baby ${SPECIES[species].name}. Look after me and I'll grow into someone special!`;
      setMessages([{ id: msgId++, role: "pet", text: hello }]);
      petSays(hello, { voice: true });
    }, 1400);
  }, [hatchName, hatchSpecies, hatching, playFx, feel, petSays]);

  const tapEgg = useCallback(() => {
    if (hatchName.trim()) hatch();
    else {
      setLine("Who am I? Name me first!");
      nameRef.current?.focus();
    }
  }, [hatch, hatchName]);

  // ---- Pages (hash routes: #/ and #/play) ----
  useEffect(() => {
    const onHash = () => setPage(window.location.hash.startsWith("#/play") ? "play" : "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const id = scrollTarget.current;
    scrollTarget.current = null;
    requestAnimationFrame(() => {
      const el = id ? document.getElementById(id) : null;
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0 });
      if (page === "play" && !id && !petRef.current.hatched) setTimeout(() => nameRef.current?.focus(), 300);
    });
  }, [page]);

  const go = useCallback((target: Page, section?: string) => {
    const hash = target === "play" ? "#/play" : "#/";
    if (target === page) {
      const el = section ? document.getElementById(section) : null;
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      if (target === "play" && !section && !petRef.current.hatched) nameRef.current?.focus();
      return;
    }
    scrollTarget.current = section ?? null;
    window.location.hash = hash;
    setPage(target);
  }, [page]);

  const goToPet = useCallback(() => go("play"), [go]);

  // ---- Chat ----
  const setMode = useCallback(
    (m: PetMode) => {
      setPet((s) => ({ ...s, mode: m }));
      setGame(null);
      setQuiz(null);
      const hint = MODES.find((x) => x.id === m)?.hint ?? "";
      if (petRef.current.hatched) petSays(`${MODES.find((x) => x.id === m)?.label} mode! ${hint}.`);
    },
    [petSays],
  );

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      const p = petRef.current;
      if (!text || loading || !p.hatched) return;
      setInput("");
      setMessages((m) => [...m, { id: msgId++, role: "user", text }]);
      teach("chat");
      if (p.asleep) setPet((s) => ({ ...s, asleep: false }));

      // Local activities answer instantly.
      const n = Number(text);
      if (p.mode === "silly" && game && !game.done && Number.isInteger(n) && n >= 1 && n <= 10) {
        const r = guess(game, n);
        setGame(r.game);
        petSays(r.line, { chat: true, voice: true });
        if (r.won) {
          setPet((s) => applyDelta(s, { playfulness: +10, happiness: +8 }));
          playFx("win");
          feel("excited");
        }
        return;
      }
      if (p.mode === "study" && quiz) {
        const right = checkAnswer(text, quiz.a);
        setQuiz(null);
        petSays(right ? `Yes! ${quiz.a}. Brain +1!` : `Close! The answer is: ${quiz.a}.`, { chat: true, voice: true });
        setPet((s) => applyDelta(s, { curiosity: right ? +8 : +3, happiness: right ? +5 : 0 }));
        feel(right ? "excited" : "thinking");
        return;
      }

      if (p.mode === "serious" && /^break this task into steps:/i.test(text)) {
        petSays(breakTask(text.replace(/^break this task into steps:/i, "")), { chat: true, voice: true });
        setPet((s) => applyDelta(s, { curiosity: +3, happiness: +2 }));
        feel("thinking");
        return;
      }

      setLoading(true);
      feel("thinking", 20000);
      try {
        const res = await generatePetReply({
          message: text,
          mode: p.mode,
          petName: p.petName,
          personality: { curiosity: p.curiosity, playfulness: p.playfulness, friendship: p.friendship },
          memories: p.savedFacts,
          hunger: p.hunger,
          energy: p.energy,
          happiness: p.happiness,
        });
        petSays(res.reply, { chat: true, voice: true });
        feel(res.emotion, 3200);
        setPet((s) => applyConversationBonus(s, s.mode));
      } catch {
        petSays("...bzzt... my antenna is fuzzy. Try again?", { chat: true });
        feel("sad");
      } finally {
        setLoading(false);
      }
    },
    [loading, game, quiz, teach, petSays, playFx, feel],
  );

  useEffect(() => {
    sendMessageRef.current = (text) => void sendMessage(text);
  }, [sendMessage]);

  const onMic = useCallback(() => {
    if (isListening) stopListening();
    else {
      clearError();
      void startListening();
    }
  }, [isListening, startListening, stopListening, clearError]);

  const remember = useCallback(
    (fact: string) => {
      setPet((s) =>
        s.savedFacts.includes(fact) || s.savedFacts.length >= MAX_FACTS
          ? s
          : applyDelta({ ...s, savedFacts: [...s.savedFacts, fact] }, { friendship: +3 }),
      );
      petSays("Got it. I'll remember that.", { chat: true });
    },
    [petSays],
  );

  const forget = useCallback(
    (fact: string | null) => {
      setPet((s) => ({ ...s, savedFacts: fact ? s.savedFacts.filter((f) => f !== fact) : [] }));
      petSays(fact ? "Forgotten." : "All forgotten. Fresh start!", { chat: true });
    },
    [petSays],
  );

  // ---- Activities ----
  const onJoke = useCallback(() => {
    petSays(tellJoke(), { chat: true, voice: true });
    setPet((s) => applyDelta(s, { playfulness: +3, happiness: +3 }));
    feel("excited");
  }, [petSays, feel]);

  const onStartGame = useCallback(() => {
    setGame(newGuessGame());
    petSays("I'm thinking of a number from 1 to 10. Guess!", { chat: true, voice: true });
    feel("excited");
  }, [petSays, feel]);

  const onGuess = useCallback((n: number) => void sendMessage(String(n)), [sendMessage]);

  const onBreakTask = useCallback((task: string) => void sendMessage(`Break this task into steps: ${task}`), [sendMessage]);

  const onStudyDone = useCallback((timer: StudyTimerState) => {
    setPet((s) => completeFrontendStudySession(timer, s).pet);
    playFx("win");
    feel("excited");
    petSays("Focus session complete! You're getting so smart.", { chat: true, voice: true });
  }, [playFx, feel, petSays]);

  const onQuiz = useCallback(() => {
    const q = quizQuestion();
    setQuiz(q);
    petSays(q.q, { chat: true, voice: true });
    feel("thinking", 6000);
  }, [petSays, feel]);

  const onBoost = useCallback((t: Trait) => {
    setPet((s) => applyDelta(s, { [t]: +15 }));
  }, []);

  const askNow = useCallback(() => {
    setRl((r) => ({ ...r, lastNudgeAt: 0 }));
  }, []);

  const doReset = useCallback((keepBrain = false) => {
    setPet(resetPetState());
    if (keepBrain) setRl((r) => ({ ...r, pending: null, lastNudgeAt: Date.now() }));
    else setRl(clearRLState());
    prevEvolution.current = "egg";
    setMessages([]);
    setGame(null);
    setQuiz(null);
    setHatchName("");
    setLine("");
    setView("pet");
    setLastOutcome(keepBrain ? "Kept what it learned about your habits." : "Waiting for its first suggestion.");
    setHatchSpecies("surprise");
    setEmotion("happy");
    cancelListening();
    cancelSpeech();
    clearError();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => nameRef.current?.focus(), 350);
  }, [cancelListening, cancelSpeech, clearError]);

  // ---- Hardware buttons ----
  const runIcon = useCallback(
    (id: IconId) => {
      const p = petRef.current;
      if (!p.hatched) {
        tapEgg();
        return;
      }
      if (id !== "stats") setView("pet");
      switch (id) {
        case "feed":
        case "play":
        case "rest":
          doCare(id);
          break;
        case "study":
          setMode("study");
          document.getElementById("play")?.scrollIntoView({ behavior: "smooth" });
          break;
        case "talk":
          chatInputRef.current?.focus();
          document.getElementById("play")?.scrollIntoView({ behavior: "smooth" });
          break;
        case "stats":
          setView((v) => (v === "stats" ? "pet" : "stats"));
          break;
        case "mode": {
          const i = MODES.findIndex((m) => m.id === p.mode);
          setMode(MODES[(i + 1) % MODES.length].id);
          break;
        }
        case "attention": {
          const a = pendingAction(rlRef.current);
          petSays(a ? nudgeLine(a, p.mode) : `All good! I think you'd ${ACTION_WORD[bestGuess(rlRef.current, p).best]} next.`);
          break;
        }
      }
    },
    [doCare, petSays, setMode, tapEgg],
  );

  const onIcon = useCallback(
    (id: IconId, i: number) => {
      setSelected(i);
      runIcon(id);
    },
    [runIcon],
  );

  const onButton = useCallback(
    (b: "A" | "B" | "C") => {
      if (b === "A") setSelected((s) => (s + 1) % ICONS.length);
      else if (b === "B") runIcon(ICONS[selected].id);
      else if (view === "stats") setView("pet");
      else if (petRef.current.hatched) doCare("pat");
      else tapEgg();
    },
    [runIcon, selected, view, doCare, tapEgg],
  );

  // Keyboard: arrows / A B C when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
 if (page !== "play") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "a") onButton("A");
      else if (k === "b") onButton("B");
      else if (k === "c") onButton("C");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onButton, page]);

  const pickSkin = useCallback((id: string) => {
    setSkinId(id);
    saveSkinId(id);
    deviceRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const pending = pendingAction(rl);
  const guessNow = bestGuess(rl, pet);
  const brainNote = !pet.hatched
    ? ""
    : rl.episodes + rl.visits.flat().reduce((a, b) => a + b, 0) === 0
      ? `${pet.petName} is still figuring you out. Care for it and it will learn your habits.`
      : guessNow.values.some((v) => v > 0.15)
        ? `${pet.petName} has learned you usually ${ACTION_WORD[guessNow.best]} when it's ${describeContext(guessNow.context)
            .join(", ")
            .toLowerCase()}.`
        : `${pet.petName} is learning what you do when it's ${describeContext(guessNow.context).join(", ").toLowerCase()}.`;

  return (
    <div className="page" id="top">
      <Header page={page} go={go} hatched={pet.hatched} />

      <main>
        {page === "home" ? (
          <HomePage
            skin={skin}
            hatched={pet.hatched}
            petName={pet.petName}
            species={pet.species}
            onPlay={goToPet}
            onHow={() => go("home", "how")}
          />
        ) : (
          <>
            <section className="pet-stage">
              <div className="wrap stage-grid">
                <div className="hero-device" ref={deviceRef}>
                  {line && (
                    <div className="speech" key={line} role="status">
                      {line}
                    </div>
                  )}
                  <TamagotchiShell skin={skin} selected={selected} attention={!!pending} onIcon={onIcon} onButton={onButton}>
                    <LcdScene
                      pet={pet}
                      emotion={emotion}
                      fx={fx}
                      view={view}
                      nudge={pending}
                      cracked={hatching}
                      onPetClick={() => doCare("pat")}
                      onEggClick={tapEgg}
                    />
                  </TamagotchiShell>
                  <CareControls onCare={doCare} disabled={!pet.hatched} asleep={pet.asleep} />
                  <p className="device-hint">
                    Tap the pet to pat it. Shell buttons: <b>A</b> next icon, <b>B</b> select, <b>C</b> back. Keyboard works too.
                  </p>
                </div>

                <div className="stage-side">
                  {pet.hatched ? (
                    <StatusMeters state={pet} brainNote={brainNote} onReset={doReset} />
                  ) : (
                    <HatchCard
                      name={hatchName}
                      setName={setHatchName}
                      species={hatchSpecies}
                      setSpecies={setHatchSpecies}
                      onHatch={hatch}
                      hatching={hatching}
                      inputRef={nameRef}
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="section" id="play">
              <div className="wrap">
                <div className="section-head">
                  <span className="eyebrow pixel">PLAY</span>
                  <h2>Talk, play and study together</h2>
                  <p className="muted">Each mode changes how it talks and gives you something to do together.</p>
                </div>
                <div className="play-grid">
                  <ChatPanel
                    pet={pet}
                    messages={messages}
                    loading={loading}
                    input={input}
                    setInput={setInput}
                    onSend={sendMessage}
                    onMode={setMode}
                    onRemember={remember}
                    isListening={isListening}
                    isRecognitionSupported={isRecognitionSupported}
                    transcript={recognisedText}
                    voiceError={speechError?.message ?? null}
                    onMic={onMic}
                    muted={isMuted}
                    setMuted={setMuted}
                    inputRef={chatInputRef}
                  />
                  <ActivityPanel
                    pet={pet}
                    game={game}
                    quizActive={!!quiz}
                    onJoke={onJoke}
                    onStartGame={onStartGame}
                    onGuess={onGuess}
                    onBreakTask={onBreakTask}
                    onStudyDone={onStudyDone}
                    onQuiz={onQuiz}
                    onForget={forget}
                    onPat={() => doCare("pat")}
                    busy={loading}
                  />
                  <BrainCard
                    rl={rl}
                    needs={pet}
                    petName={pet.petName}
                    fast={fast}
                    setFast={setFast}
                    onAskNow={askNow}
                    lastOutcome={lastOutcome}
                    hatched={pet.hatched}
                  />
                  <EvolutionCard pet={pet} onBoost={onBoost} />
                </div>
              </div>
            </section>

            <section className="section tint" id="shells">
              <div className="wrap">
                <div className="section-head">
                  <span className="eyebrow pixel">SHELLS</span>
                  <h2>Pick a shell</h2>
                  <p className="muted">{skin.name} is on right now. Tap any shell to swap; it's saved for next time.</p>
                </div>
                <ShellGallery current={skinId} onPick={pickSkin} />
              </div>
            </section>
          </>
        )}
      </main>

      <Footer go={go} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
