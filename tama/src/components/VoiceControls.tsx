const MIC = "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3";
const SPEAKER = "M4 9v6h4l5 4V5L8 9H4zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12";
const SPEAKER_OFF = "M4 9v6h4l5 4V5L8 9H4zM17 9l5 6M22 9l-5 6";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export function VoiceControls({
  isListening,
  isRecognitionSupported,
  onMic,
  muted,
  setMuted,
  disabled,
}: {
  isListening: boolean;
  isRecognitionSupported: boolean;
  onMic: () => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
  disabled?: boolean;
}) {
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
    </>
  );
}
