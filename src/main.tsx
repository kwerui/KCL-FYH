import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { VoiceTestPage } from "./test/VoiceTestPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VoiceTestPage />
  </StrictMode>,
);
