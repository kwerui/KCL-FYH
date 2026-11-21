import { useEffect, useRef } from "react";
import type { PetMode } from "../ai/types";
import type { PetState } from "../game/petState";
import { MAX_FACTS } from "../game/petState";
import { ModeSelector } from "./ModeSelector";
import { PetSprite } from "./PetSprite";
import { VoiceControls } from "./VoiceControls";
import type { VoicePreferences } from "../../../src/voice/voicePreferences";

export type ChatMsg = { id: number; role: "user" | "pet"; text: string };

type Props = {
  pet: PetState;
  messages: ChatMsg[];
  loading: boolean;
  input: string;
  setInput: (s: string) => void;
  onSend: (text: string) => void;
  onMode: (m: PetMode) => void;
  onRemember: (text: string) => void;
  isListening: boolean;
  isRecognitionSupported: boolean;
  isSynthesisSupported: boolean;
  transcript: string;
  voiceError: string | null;
  onMic: () => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
  voices: SpeechSynthesisVoice[];
  voicePreferences: VoicePreferences;
  setVoiceURI: (voiceURI: string) => void;
  setVoicePitch: (pitch: number) => void;
  setVoiceRate: (rate: number) => void;
  onCutePreset: () => void;
  onPreviewVoice: () => boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export function ChatPanel(p: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [p.messages, p.loading]);

  const listening = p.isListening;
  const full = p.pet.savedFacts.length >= MAX_FACTS;

  return (
    <section className="card chat-card" aria-label="Chat with your pet">
      <div className="card-head">
        <h3>Talk to {p.pet.petName || "your pet"}</h3>
        <ModeSelector current={p.pet.mode} onChange={p.onMode} />
      </div>

      <div className="chat-list" ref={listRef} aria-live="polite">
        {p.messages.length === 0 && (
          <p className="muted center">
            {p.pet.hatched ? "Say hi! Type below or tap the mic." : "Hatch your egg to start chatting."}
          </p>
        )}
        {p.messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            {m.role === "pet" && (
              <span className="msg-avatar">
                <PetSprite species={p.pet.species} evolution={p.pet.evolution} blink={false} className="fill" />
              </span>
            )}
            <span className="msg-text">{m.text}</span>
            {m.role === "user" && p.pet.mode === "companion" && (
              <button
                type="button"
                className={`pin ${p.pet.savedFacts.includes(m.text) ? "saved" : ""}`}
                onClick={() => p.onRemember(m.text)}
                disabled={p.pet.savedFacts.includes(m.text) || full}
                title={full ? "Memory is full: forget something first" : "Let your pet remember this"}
              >
                {p.pet.savedFacts.includes(m.text) ? "Remembered" : "Remember"}
              </button>
            )}
          </div>
        ))}
        {p.loading && (
          <div className="msg pet typing">
            <span className="dots"><i /><i /><i /></span>
          </div>
        )}
      </div>

      <form
        className="chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          p.onSend(p.input);
        }}
      >
        <input
          ref={p.inputRef}
          className="chat-input"
          placeholder={listening ? "Listening..." : p.pet.hatched ? "Type a message..." : "Hatch your pet first"}
          value={listening ? p.transcript : p.input}
          onChange={(e) => p.setInput(e.target.value)}
          disabled={p.loading || !p.pet.hatched}
          maxLength={500}
          aria-label="Message"
        />
        <VoiceControls
          isListening={p.isListening}
          isRecognitionSupported={p.isRecognitionSupported}
          isSynthesisSupported={p.isSynthesisSupported}
          onMic={p.onMic}
          muted={p.muted}
          setMuted={p.setMuted}
          voices={p.voices}
          voicePreferences={p.voicePreferences}
          setVoiceURI={p.setVoiceURI}
          setVoicePitch={p.setVoicePitch}
          setVoiceRate={p.setVoiceRate}
          onCutePreset={p.onCutePreset}
          onPreviewVoice={p.onPreviewVoice}
          disabled={p.loading || !p.pet.hatched}
        />
        <button type="submit" className="btn btn-primary" disabled={p.loading || !p.input.trim() || !p.pet.hatched}>
          Send
        </button>
      </form>
      {p.voiceError && <p className="muted" role="alert">{p.voiceError}</p>}
    </section>
  );
}
