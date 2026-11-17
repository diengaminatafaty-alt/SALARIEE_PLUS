import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "../types/salariee";

export interface SpeechController {
  supported: boolean;
  speaking: boolean;
  speak: (text: { fr: string; wo: string }) => void;
  stop: () => void;
}

/**
 * Lit un texte à voix haute (Web Speech API).
 * Le wolof n'a pas toujours de voix installée sur le téléphone :
 * on tente `wo-SN`, sinon la voix française lit le texte, et le sous-titre wolof reste affiché.
 */
export function useSpeech(language: Language): SpeechController {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  useEffect(() => stop, [stop]);

  const speak = useCallback(
    (text: { fr: string; wo: string }) => {
      if (!supported) return;
      window.speechSynthesis.cancel();

      const content = language === "wo" ? text.wo : text.fr;
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = language === "wo" ? "wo-SN" : "fr-FR";
      utterance.rate = 0.92;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();
      const target = voices.find((voice) =>
        voice.lang.toLowerCase().startsWith(language === "wo" ? "wo" : "fr")
      );
      if (target) utterance.voice = target;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [language, supported]
  );

  return { supported, speaking, speak, stop };
}
