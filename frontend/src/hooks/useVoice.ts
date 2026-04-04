import { useCallback } from "react";

const languageMap: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  ta: "ta-IN",
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useVoice(language: string = "en") {
  const speak = useCallback(
    async (input: string | string[]) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      window.speechSynthesis.cancel();

      const parts = Array.isArray(input)
        ? input.map((part) => part.trim()).filter(Boolean)
        : input
            .split(". ")
            .map((part) => part.trim())
            .filter(Boolean);

      for (const part of parts) {
        await new Promise<void>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(part);
          utterance.lang = languageMap[language] || "en-US";
          utterance.rate = 0.92;
          utterance.pitch = 1;
          utterance.volume = 1;

          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();

          window.speechSynthesis.speak(utterance);
        });

        await wait(220);
      }
    },
    [language]
  );

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}