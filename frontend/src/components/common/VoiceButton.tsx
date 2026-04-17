type VoiceButtonProps = {
  label: string;
  onSpeak: () => void;
  onStop: () => void;
  isSpeaking: boolean;
};

function VoiceButton({ label, onSpeak, onStop, isSpeaking }: VoiceButtonProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={onSpeak}
        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
      >
        {label}
      </button>
      {isSpeaking ? (
        <button
          onClick={onStop}
          className="rounded-2xl border border-rose-500/30 bg-rose-500/15 px-4 py-3 font-medium text-rose-200 transition hover:bg-rose-500/25"
        >
          Stop
        </button>
      ) : null}
    </div>
  );
}

export default VoiceButton;
