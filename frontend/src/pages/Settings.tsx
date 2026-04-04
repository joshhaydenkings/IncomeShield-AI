import { useState } from "react";
import type { WorkerProfile } from "../types";

type SettingsProps = {
  worker: WorkerProfile;
  onSave: (worker: WorkerProfile) => Promise<void>;
  onBack: () => void;
};

const SHIFT_OPTIONS = [
  "6 AM - 11 AM",
  "11 AM - 4 PM",
  "4 PM - 9 PM",
  "6 PM - 11 PM",
] as const;

const WORK_TYPE_OPTIONS = [
  "Food Delivery",
  "Parcel Delivery",
  "Grocery / Quick Commerce",
  "Ride Share",
] as const;

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
] as const;

const PLAN_OPTIONS = ["Lite", "Core", "Shield+"] as const;

function Settings({ worker, onSave, onBack }: SettingsProps) {
  const [form, setForm] = useState<WorkerProfile>(worker);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = <K extends keyof WorkerProfile>(
    key: K,
    value: WorkerProfile[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111f] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Profile settings</h1>
            <p className="mt-2 text-slate-400">
              Update your work profile and saved plan.
            </p>
          </div>

          <button
            onClick={onBack}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/10"
          >
            Back
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name (read only)">
              <input
                value={form.name}
                disabled
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400 outline-none"
              />
            </Field>

            <Field label="City">
              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </Field>

            <Field label="Zone">
              <input
                value={form.zone}
                onChange={(e) => updateField("zone", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </Field>

            <Field label="Shift">
              <OptionGrid
                options={SHIFT_OPTIONS.map((item) => ({
                  value: item,
                  label: item,
                }))}
                value={form.shift}
                onChange={(value) => updateField("shift", value)}
                columns={2}
              />
            </Field>

            <Field label="Work type">
              <OptionGrid
                options={WORK_TYPE_OPTIONS.map((item) => ({
                  value: item,
                  label: item,
                }))}
                value={form.workerType}
                onChange={(value) => updateField("workerType", value)}
                columns={2}
              />
            </Field>

            <Field label="Language">
              <OptionGrid
                options={LANGUAGE_OPTIONS}
                value={form.language}
                onChange={(value) => updateField("language", value)}
                columns={3}
              />
            </Field>

            <Field label="Weekly plan">
              <OptionGrid
                options={PLAN_OPTIONS.map((item) => ({
                  value: item,
                  label: item,
                }))}
                value={form.plan}
                onChange={(value) => updateField("plan", value as WorkerProfile["plan"])}
                columns={3}
              />
            </Field>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-white px-5 py-3 font-semibold text-[#07111f] transition hover:bg-slate-200 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            <button
              onClick={onBack}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="md:col-span-1">
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={`grid gap-3 ${
        columns === 3 ? "grid-cols-3" : "grid-cols-2"
      }`}
    >
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              active
                ? "border-white bg-white text-[#07111f]"
                : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default Settings;