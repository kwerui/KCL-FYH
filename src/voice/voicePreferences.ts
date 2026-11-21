export const VOICE_PREFERENCES_STORAGE_KEY = "tama.voice-preferences";
export const CUTE_PIXRL_PREFERENCES: VoicePreferences = {
  voiceURI: null,
  pitch: 1.25,
  rate: 1.08,
};

const DEFAULT_PREFERENCES: VoicePreferences = {
  voiceURI: null,
  pitch: 1,
  rate: 1,
};

export type VoicePreferences = {
  voiceURI: string | null;
  pitch: number;
  rate: number;
};

export type VoiceStorage = Pick<Storage, "getItem" | "setItem">;

const clamp = (value: unknown, minimum: number, maximum: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, Math.round(value * 100) / 100))
    : fallback;

export function normaliseVoicePreferences(value: Partial<VoicePreferences> | null | undefined): VoicePreferences {
  return {
    voiceURI: typeof value?.voiceURI === "string" && value.voiceURI ? value.voiceURI : null,
    pitch: clamp(value?.pitch, 0.8, 1.5, DEFAULT_PREFERENCES.pitch),
    rate: clamp(value?.rate, 0.75, 1.25, DEFAULT_PREFERENCES.rate),
  };
}

export function chooseDefaultVoiceId(voices: SpeechSynthesisVoice[]): string | null {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const cheerfulVoice = englishVoices.find((voice) =>
    /samantha|victoria|karen|ava|zoe|jenny|aria|serena|google us english/i.test(voice.name),
  );
  return (cheerfulVoice ?? englishVoices[0])?.voiceURI ?? null;
}

export function loadVoicePreferences(storage: Pick<Storage, "getItem"> | null): VoicePreferences {
  if (!storage) return DEFAULT_PREFERENCES;

  try {
    const stored = storage.getItem(VOICE_PREFERENCES_STORAGE_KEY);
    return stored ? normaliseVoicePreferences(JSON.parse(stored)) : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveVoicePreferences(preferences: VoicePreferences, storage: VoiceStorage | null): void {
  if (!storage) return;

  try {
    storage.setItem(VOICE_PREFERENCES_STORAGE_KEY, JSON.stringify(normaliseVoicePreferences(preferences)));
  } catch {
    // Voice settings are optional when browser storage is unavailable.
  }
}
