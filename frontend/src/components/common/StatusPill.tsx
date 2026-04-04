type StatusPillProps = {
  label: string;
  tone?: "default" | "good" | "warn" | "danger";
};

function StatusPill({ label, tone = "default" }: StatusPillProps) {
  const toneClass =
    tone === "good"
      ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-300"
      : tone === "warn"
        ? "border-amber-500/20 bg-amber-500/15 text-amber-300"
        : tone === "danger"
          ? "border-rose-500/20 bg-rose-500/15 text-rose-300"
          : "border-white/10 bg-white/5 text-slate-300";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${toneClass}`}
    >
      {label}
    </span>
  );
}

export default StatusPill;