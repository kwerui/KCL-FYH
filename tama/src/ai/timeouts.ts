// Keep the browser deadline longer than the server's Gemini deadline so the
// client can receive a scripted fallback response instead of aborting first.
export const GEMINI_TIMEOUT_MS = 20_000;
export const CLIENT_TIMEOUT_MS = 25_000;
