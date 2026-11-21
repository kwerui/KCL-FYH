import { type FormEvent, useEffect, useState } from "react";
import { useSpeech } from "./useSpeech";

/**
 * Optional development-only harness. It is not imported by the main app, so
 * teammates can render it in a temporary route or Storybook story.
 */
export function VoiceTestPanel() {
  const voice = useSpeech();
  const [text, setText] = useState("");

  useEffect(() => {
    setText(voice.recognisedText);
  }, [voice.recognisedText]);

  function speakText(event: FormEvent) {
    event.preventDefault();
    voice.speak(text);
  }

  return (
    <section aria-labelledby="voice-test-title">
      <h2 id="voice-test-title">Voice API test</h2>
      <p>
        Input: {voice.isRecognitionSupported ? "supported" : "unavailable"} · Output: {" "}
        {voice.isSynthesisSupported ? "supported" : "unavailable"}
      </p>

      <button type="button" onClick={() => void voice.startListening()} disabled={voice.isListening}>
        {voice.isListening ? "Listening…" : "Start listening"}
      </button>
      <button type="button" onClick={voice.stopListening} disabled={!voice.isListening}>
        Stop listening
      </button>
      <button type="button" onClick={voice.cancelListening} disabled={!voice.isListening}>
        Cancel listening
      </button>

      <form onSubmit={speakText}>
        <label htmlFor="voice-test-text">Text to speak</label>
        <textarea
          id="voice-test-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
        />
        <button type="submit" disabled={voice.isMuted || !text.trim()}>
          {voice.isSpeaking ? "Speaking…" : "Speak text"}
        </button>
        <button type="button" onClick={voice.cancelSpeech} disabled={!voice.isSpeaking}>
          Stop speech
        </button>
      </form>

      <label>
        <input
          type="checkbox"
          checked={voice.isMuted}
          onChange={(event) => voice.setMuted(event.target.checked)}
        />
        Mute speech output
      </label>

      {voice.error && (
        <p role="alert">
          {voice.error.message} <button type="button" onClick={voice.clearError}>Dismiss</button>
        </p>
      )}
    </section>
  );
}
