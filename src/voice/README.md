# Voice module

`useSpeech` is a browser-only React hook that is intentionally independent of
the pet state and AI client. It translates microphone input to text and text to
browser speech output only.

## Integrating with the chat UI

```tsx
import { useSpeech } from "../voice";

function ChatPanel() {
  const voice = useSpeech({ language: "en-GB" });

  async function sendRecognisedMessage() {
    const response = await generatePetReply({ message: voice.recognisedText /* ... */ });
    voice.speak(response.reply);
  }

  return (
    <>
      <button onClick={() => void voice.startListening()} disabled={voice.isListening}>
        {voice.isListening ? "Listening…" : "Talk"}
      </button>
      <textarea value={voice.recognisedText} onChange={(event) => voice.setRecognisedText(event.target.value)} />
      <button onClick={sendRecognisedMessage}>Send</button>
      <button onClick={() => voice.setMuted(!voice.isMuted)}>{voice.isMuted ? "Unmute" : "Mute"}</button>
      {voice.error && <p role="alert">{voice.error.message}</p>}
    </>
  );
}
```

The chat UI owns when recognised text is sent to `generatePetReply`; call
`voice.speak(response.reply)` only after the AI/fallback response is available.
Use `stopListening`, `cancelListening`, and `cancelSpeech` for the relevant UI
controls. Keep typing enabled as a fallback whenever `isRecognitionSupported`
is false or `error` is set.

## Manual test harness

`VoiceTestPanel` is not imported by the app. Render it temporarily in a local
development route or Storybook story:

```tsx
import { VoiceTestPanel } from "../voice";

export function VoicePlayground() {
  return <VoiceTestPanel />;
}
```

It exercises permission, transcription, synthesis, mute, cancellation, and
visible error states without changing the main Tamagotchi UI.

## Temporary Vite harness

Until the main frontend exists, this repository mounts `VoiceTestPage` from
`src/main.tsx`. Start it with:

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite (normally `http://localhost:5173`). Run
`npm run build` before handing the branch over; it type-checks the module and
then bundles the page. When the frontend is ready, it can replace `src/main.tsx`
and `src/test/VoiceTestPage.tsx` while retaining the Vite configuration and the
entire `src/voice` folder.

## Browser limits

Speech recognition has limited browser support. `getUserMedia` requires HTTPS
(localhost is normally treated as secure), and some recognition implementations
need a network connection. Speech synthesis support is wider but uses the
browser/device voices.
