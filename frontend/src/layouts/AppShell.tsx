import { Settings } from "lucide-react";
import { tr } from "../services/translations";
import type { WorkerProfile } from "../types";

type Page = "dashboard" | "plans" | "alerts" | "claims" | "admin";

type AppShellProps = {
  worker: WorkerProfile;
  page: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
  simpleMode: boolean;
  canUseSimpleMode: boolean;
  onToggleSimpleMode: () => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
  onOpenPolicy: () => void;
};

function AppShell({
  worker,
  page,
  onNavigate,
  children,
  simpleMode,
  canUseSimpleMode,
  onToggleSimpleMode,
  onSignOut,
  onOpenSettings,
  onOpenPolicy,
}: AppShellProps) {
  const navItems: { key: Exclude<Page, "admin">; label: string }[] = [
    { key: "dashboard", label: tr(worker.language, "dashboard") },
    { key: "plans", label: tr(worker.language, "plans") },
    { key: "alerts", label: tr(worker.language, "alerts") },
    { key: "claims", label: tr(worker.language, "claims") },
  ];

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1728]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#13233b] text-lg font-bold text-white ring-1 ring-white/10">
              IA
            </div>

            <div>
              <div className="text-lg font-bold text-white">IncomeShield AI</div>
              <div className="text-sm text-slate-400">
                Protection that keeps up with work
              </div>
            </div>
          </div>

          <div className="hidden flex-wrap items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavButton
                key={item.key}
                label={item.label}
                active={page === item.key}
                onClick={() => onNavigate(item.key)}
              />
            ))}
            <button
              onClick={onOpenPolicy}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-200 transition hover:bg-white/10"
            >
              Policy
            </button>
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-200 transition hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={onSignOut}
              className="rounded-2xl border border-rose-500/30 bg-rose-500/15 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-500/25"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-4 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <InfoChip label="Name" value={worker.name} />
            <InfoChip
              label={tr(worker.language, "city")}
              value={formatTitleCase(worker.city)}
            />
            <InfoChip
              label={tr(worker.language, "language")}
              value={worker.language.toUpperCase()}
            />
            <InfoChip
              label={tr(worker.language, "weeklyPlan")}
              value={worker.plan}
            />
            {canUseSimpleMode ? (
              <SimpleModeToggle
                enabled={simpleMode}
                onToggle={onToggleSimpleMode}
              />
            ) : null}
          </div>
        </div>
      </div>

      <main>{children}</main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b1728]/95 px-3 py-3 backdrop-blur md:hidden">
        <div className="mb-3 flex items-center gap-2">
          {canUseSimpleMode ? (
            <div className="flex-1">
              <SimpleModeToggle
                enabled={simpleMode}
                onToggle={onToggleSimpleMode}
                mobile
              />
            </div>
          ) : null}
          <button
            onClick={onOpenPolicy}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Policy
          </button>
          <button
            onClick={onOpenSettings}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Settings
          </button>
          <button
            onClick={onSignOut}
            className="rounded-2xl border border-rose-500/30 bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/25"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`rounded-2xl px-2 py-3 text-xs font-semibold transition ${
                page === item.key
                  ? "bg-white text-[#07111f]"
                  : "bg-white/5 text-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-24 md:hidden" />
    </div>
  );
}

type NavButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function NavButton({ label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 font-medium transition ${
        active
          ? "bg-white text-[#07111f]"
          : "bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

type InfoChipProps = {
  label: string;
  value: string;
};

function InfoChip({ label, value }: InfoChipProps) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
      <span className="font-medium text-slate-200">{label}:</span> {value}
    </div>
  );
}

type SimpleModeToggleProps = {
  enabled: boolean;
  onToggle: () => void;
  mobile?: boolean;
};

function SimpleModeToggle({
  enabled,
  onToggle,
  mobile = false,
}: SimpleModeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition ${
        enabled
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 bg-white/5 text-slate-300"
      } ${mobile ? "w-full justify-between" : ""}`}
    >
      <span className="font-medium">Simple mode</span>

      <span
        className={`relative h-6 w-11 rounded-full transition ${
          enabled ? "bg-emerald-400" : "bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            enabled ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>

      <span className={enabled ? "text-emerald-300" : "text-slate-400"}>
        {enabled ? "On" : "Off"}
      </span>
    </button>
  );
}

function formatTitleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default AppShell;