type VoiceButtonProps = {
  label: string;
  onClick: () => void;
};

function VoiceButton({ label, onClick }: VoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
    >
      🔊 {label}
    </button>
  );
}

export default VoiceButton;