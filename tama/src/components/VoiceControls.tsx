const MIC = "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3";
const SPEAKER = "M4 9v6h4l5 4V5L8 9H4zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12";
const SPEAKER_OFF = "M4 9v6h4l5 4V5L8 9H4zM17 9l5 6M22 9l-5 6";
import type { VoicePreferences } from "../../../src/voice/voicePreferences";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export function VoiceControls({
  isListening,
  isRecognitionSupported,
  isSynthesisSupported,
  onMic,
  muted,
  setMuted,
  voices,
  voicePreferences,
  setVoiceURI,
  setVoicePitch,
  setVoiceRate,
  onCutePreset,
  onPreviewVoice,
  disabled,
}: {
  isListening: boolean;
  isRecognitionSupported: boolean;
  isSynthesisSupported: boolean;
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
  disabled?: boolean;
}) {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const micTitle =
    !isRecognitionSupported
      ? "Voice input isn't supported in this browser. Typing works!"
      : isListening
          ? "Stop listening"
          : "Speak to your pet";
  return (
    <>
      <button
        type="button"
        className={`icon-btn ${isListening ? "live" : ""}`}
        onClick={onMic}
        disabled={disabled || !isRecognitionSupported}
        title={micTitle}
        aria-label={micTitle}
      >
        <Icon d={MIC} />
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setMuted(!muted)}
        title={muted ? "Unmute voice" : "Mute voice"}
        aria-label={muted ? "Unmute voice" : "Mute voice"}
        aria-pressed={muted}
      >
        <Icon d={muted ? SPEAKER_OFF : SPEAKER} />
      </button>
      <details className="voice-settings">
        <summary>Voice</summary>
        {!isSynthesisSupported ? (
          <p className="muted small">Speech output is unavailable in this browser.</p>
        ) : (
          <div className="voice-settings-grid">
            <label>
              Voice
              <select
                value={voicePreferences.voiceURI ?? ""}
                onChange={(event) => setVoiceURI(event.target.value)}
              >
                <option value="">Browser default{voices.length === 0 ? " (loading voices…)" : ""}</option>
                {englishVoices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
              </select>
            </label>
            <button type="button" className="btn btn-secondary small" onClick={onCutePreset}>Cute Pixrl</button>
            <button type="button" className="btn btn-secondary small" onClick={onPreviewVoice} disabled={muted}>Preview</button>
            <label>
              Pitch <output>{voicePreferences.pitch.toFixed(2)}</output>
              <input type="range" min="0.8" max="1.5" step="0.05" value={voicePreferences.pitch} onChange={(event) => setVoicePitch(Number(event.target.value))} />
            </label>
            <label>
              Speed <output>{voicePreferences.rate.toFixed(2)}</output>
              <input type="range" min="0.75" max="1.25" step="0.05" value={voicePreferences.rate} onChange={(event) => setVoiceRate(Number(event.target.value))} />
            </label>
            <p className="muted small">Preferences stay on this device.</p>
            {voices.length > 0 && englishVoices.length === 0 && <p className="muted small">No English voices are installed; using your browser default.</p>}
          </div>
        )}
      </details>
    </>
  );
}
