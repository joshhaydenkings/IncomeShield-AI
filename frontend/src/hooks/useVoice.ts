import { useCallback, useRef, useState } from "react";

const languageMap: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  ta: "ta-IN",
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useVoice(language: string = "en") {
  const runIdRef = useRef(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(
    async (input: string | string[]) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      runIdRef.current += 1;
      const runId = runIdRef.current;
      setIsSpeaking(true);
      window.speechSynthesis.cancel();

      const parts = Array.isArray(input)
        ? input.map((part) => part.trim()).filter(Boolean)
        : input
            .split(". ")
            .map((part) => part.trim())
            .filter(Boolean);

      try {
        for (const part of parts) {
          if (runIdRef.current !== runId) {
            break;
          }

          await new Promise<void>((resolve) => {
            const utterance = new SpeechSynthesisUtterance(part);
            utterance.lang = languageMap[language] || "en-US";
            utterance.rate = 0.92;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            if (runIdRef.current !== runId) {
              resolve();
              return;
            }

            window.speechSynthesis.speak(utterance);
          });

          if (runIdRef.current !== runId) {
            break;
          }

          await wait(220);
        }
      } finally {
        if (runIdRef.current === runId) {
          setIsSpeaking(false);
        }
      }
    },
    [language]
  );

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    runIdRef.current += 1;
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop, isSpeaking };
}
