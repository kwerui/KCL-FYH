import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionResultLike = {
  0: { transcript: string };
};

type RecognitionEventLike = Event & {
  resultIndex: number;
  results: ArrayLike<RecognitionResultLike>;
};

type RecognitionErrorEventLike = Event & {
  error: string;
};

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: RecognitionErrorEventLike) => void) | null;
  onresult: ((event: RecognitionEventLike) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export type SpeechError = {
  code: string;
  message: string;
};

export type UseSpeechOptions = {
  /** BCP 47 language tag passed to browser speech recognition. */
  language?: string;
};

export type SpeechControls = {
  isRecognitionSupported: boolean;
  isSynthesisSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  recognisedText: string;
  error: SpeechError | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  cancelListening: () => void;
  speak: (text: string) => boolean;
  cancelSpeech: () => void;
  setMuted: (muted: boolean) => void;
  setRecognisedText: (text: string) => void;
  clearError: () => void;
};

function getRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;

  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function recognitionErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "not-allowed": "Microphone access was denied. You can still type your message.",
    "service-not-allowed": "Speech recognition is not allowed by this browser.",
    "no-speech": "No speech was detected. Please try again.",
    "audio-capture": "No microphone was found or it is unavailable.",
    network: "Speech recognition needs a network connection in this browser.",
    "language-not-supported": "The selected recognition language is not supported.",
  };

  return messages[code] ?? "Speech recognition failed. Please try again or type your message.";
}

/**
 * Browser-only Web Speech API adapter. It deliberately only converts between
 * spoken audio and text: callers decide how recognised text is sent to an AI.
 */
export function useSpeech(options: UseSpeechOptions = {}): SpeechControls {
  const { language = "en-GB" } = options;
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mutedRef = useRef(false);
  const isCancellingRecognitionRef = useRef(false);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMutedState] = useState(false);
  const [recognisedText, setRecognisedText] = useState("");
  const [error, setError] = useState<SpeechError | null>(null);

  const isRecognitionSupported = Boolean(getRecognitionConstructor());
  const isSynthesisSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const clearError = useCallback(() => setError(null), []);

  const cancelSpeech = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    utteranceRef.current = null;
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
  }, []);

  const setMuted = useCallback(
    (muted: boolean) => {
      mutedRef.current = muted;
      setIsMutedState(muted);
      if (muted) cancelSpeech();
    },
    [cancelSpeech],
  );

  const speak = useCallback(
    (text: string): boolean => {
      const message = text.trim();
      if (!message || mutedRef.current) return false;

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setError({
          code: "synthesis-unsupported",
          message: "Speech output is not supported in this browser.",
        });
        return false;
      }

      cancelSpeech();
      setError(null);

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = language;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
          setIsSpeaking(false);
        }
      };
      utterance.onerror = () => {
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
          setIsSpeaking(false);
          setError({ code: "synthesis-error", message: "Speech output could not be played." });
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [cancelSpeech, language],
  );

  const getRecognition = useCallback((): SpeechRecognitionLike | null => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
      return recognitionRef.current;
    }

    const Recognition = getRecognitionConstructor();
    if (!Recognition) return null;

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      setRecognisedText(transcript.trim());
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (isCancellingRecognitionRef.current) {
        isCancellingRecognitionRef.current = false;
        return;
      }
      setError({ code: event.error, message: recognitionErrorMessage(event.error) });
    };
    recognition.onend = () => {
      isCancellingRecognitionRef.current = false;
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    return recognition;
  }, [language]);

  const startListening = useCallback(async () => {
    const recognition = getRecognition();
    if (!recognition) {
      setError({
        code: "recognition-unsupported",
        message: "Speech input is not supported in this browser. Please type your message.",
      });
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError({
        code: "microphone-unsupported",
        message: "Microphone access is unavailable. Please type your message.",
      });
      return;
    }

    try {
      // Prompt for permission before starting the recognition service.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      isCancellingRecognitionRef.current = false;
      setError(null);
      setIsListening(true);
      recognition.start();
    } catch (cause) {
      setIsListening(false);
      const denied = cause instanceof DOMException && cause.name === "NotAllowedError";
      setError({
        code: denied ? "not-allowed" : "microphone-error",
        message: denied
          ? "Microphone access was denied. You can still type your message."
          : "The microphone could not be started. Please try again or type your message.",
      });
    }
  }, [getRecognition]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const cancelListening = useCallback(() => {
    isCancellingRecognitionRef.current = true;
    recognitionRef.current?.abort();
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      cancelSpeech();
    };
  }, [cancelSpeech]);

  return {
    isRecognitionSupported,
    isSynthesisSupported,
    isListening,
    isSpeaking,
    isMuted,
    recognisedText,
    error,
    startListening,
    stopListening,
    cancelListening,
    speak,
    cancelSpeech,
    setMuted,
    setRecognisedText,
    clearError,
  };
}
