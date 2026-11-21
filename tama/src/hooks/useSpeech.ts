import { useCallback, useRef, useState } from "react";

export type SpeechState = "idle" | "listening" | "unsupported";

export function useSpeech() {
  const [speechState, setSpeechState] = useState<SpeechState>(
    typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
      ? "idle"
      : "unsupported"
  );
  const [transcript, setTranscript] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [muted, setMuted] = useState(false);

  const startListening = useCallback((onResult: (text: string) => void) => {
    const SpeechRec =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    const rec = new SpeechRec();
    rec.lang = "en-GB";
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setSpeechState("listening");
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        onResult(t);
        setTranscript("");
      }
    };
    rec.onerror = () => setSpeechState("idle");
    rec.onend = () => setSpeechState("idle");

    recognitionRef.current = rec;
    rec.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setSpeechState("idle");
  }, []);

  const speak = useCallback((text: string) => {
    if (muted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0;
    utt.pitch = 1.3;
    utt.volume = 0.9;
    // Prefer a soft voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      /samantha|karen|moira|zira|google uk/i.test(v.name)
    );
    if (preferred) utt.voice = preferred;
    window.speechSynthesis.speak(utt);
  }, [muted]);

  return { speechState, transcript, startListening, stopListening, speak, muted, setMuted };
}
