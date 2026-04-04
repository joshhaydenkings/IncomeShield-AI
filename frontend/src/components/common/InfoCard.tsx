import type { ReactNode } from "react";

type InfoCardProps = {
  label: string;
  value: string;
  subtext?: string;
  icon?: ReactNode;
  dark?: boolean;
};

function InfoCard({ label, value, subtext, icon, dark = false }: InfoCardProps) {
  return (
    <div
      className={`relative rounded-3xl p-5 shadow-sm ring-1 ${
        dark
          ? "bg-[#0d1b2e] text-white ring-white/10"
          : "bg-[#0f1e33] text-white ring-white/10"
      }`}
    >
      {icon ? (
        <div
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl ${
            dark ? "bg-white/10 text-slate-200" : "bg-white/5 text-slate-300"
          }`}
        >
          {icon}
        </div>
      ) : null}

      <div className={`${icon ? "pr-12" : ""}`}>
        <div className={`text-sm ${dark ? "text-slate-300" : "text-slate-400"}`}>
          {label}
        </div>

        <div className="mt-2 text-2xl font-semibold leading-tight">
          {value}
        </div>

        {subtext ? (
          <div
            className={`mt-2 text-sm leading-relaxed ${
              dark ? "text-slate-300" : "text-slate-400"
            }`}
          >
            {subtext}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default InfoCard;