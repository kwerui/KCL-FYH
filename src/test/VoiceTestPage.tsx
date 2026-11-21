import { VoiceTestPanel } from "../voice";

/** Temporary Vite entry point for manually testing the voice module. */
export function VoiceTestPage() {
  return (
    <main>
      <h1>Voice module playground</h1>
      <p>This temporary page mounts the isolated voice test panel only.</p>
      <VoiceTestPanel />
    </main>
  );
}
