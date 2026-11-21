// Shared AI contract — agreed by all three engineers before parallel work

export type PetMode = "silly" | "serious" | "study" | "companion";

export type PetEmotion = "happy" | "sad" | "excited" | "thinking" | "sleepy" | "hungry";

export type PetPersonality = {
  curiosity: number;   // 0–100
  playfulness: number; // 0–100
  friendship: number;  // 0–100
};

export type PetRequest = {
  message: string;
  mode: PetMode;
  petName: string;
  personality: PetPersonality;
  memories: string[];  // only user-approved facts
  hunger: number;      // 0–100 (higher = more hungry)
  energy: number;      // 0–100
  happiness: number;   // 0–100
};

export type PetResponse = {
  reply: string;
  emotion: PetEmotion;
  suggestedAction?: "feed" | "play" | "rest" | null;
};

// Returns the same shape whether using an LLM or a local fallback.
// Implementation lives in client.ts — import from there, not here.
export type GeneratePetReply = (request: PetRequest) => Promise<PetResponse>;
