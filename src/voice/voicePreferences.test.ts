import { describe, expect, it } from "vitest";
import {
  CUTE_PIXRL_PREFERENCES,
  chooseDefaultVoiceId,
  loadVoicePreferences,
  normaliseVoicePreferences,
  saveVoicePreferences,
} from "./voicePreferences";

const voice = (voiceURI: string, name: string, lang = "en-GB") => ({ voiceURI, name, lang }) as SpeechSynthesisVoice;

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("voice preferences", () => {
  it("chooses a cheerful English voice when one is available, otherwise the first English voice", () => {
    expect(chooseDefaultVoiceId([voice("neutral", "English Neutral"), voice("joy", "Microsoft Jenny Online")])).toBe("joy");
    expect(chooseDefaultVoiceId([voice("british", "English UK"), voice("french", "French", "fr-FR")])).toBe("british");
    expect(chooseDefaultVoiceId([voice("french", "French", "fr-FR")])).toBeNull();
  });

  it("keeps Cute Pixrl playful but within safe speech ranges", () => {
    expect(normaliseVoicePreferences(CUTE_PIXRL_PREFERENCES)).toEqual(CUTE_PIXRL_PREFERENCES);
    expect(normaliseVoicePreferences({ voiceURI: "a", pitch: 99, rate: 0 })).toEqual({ voiceURI: "a", pitch: 1.5, rate: 0.75 });
  });

  it("persists selected voice, pitch, and speed", () => {
    const storage = new MemoryStorage();
    saveVoicePreferences({ voiceURI: "cute", pitch: 1.2, rate: 1.1 }, storage);

    expect(loadVoicePreferences(storage)).toEqual({ voiceURI: "cute", pitch: 1.2, rate: 1.1 });
  });
});
