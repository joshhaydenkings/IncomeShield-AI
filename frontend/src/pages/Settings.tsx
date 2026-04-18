import { useEffect, useState } from "react";
import type { WorkerProfile } from "../types";

type SettingsWorker = WorkerProfile & {
  pincode?: string;
  normalized_location?: string;
  resolved_name?: string;
  resolved_admin1?: string;
  resolved_country?: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string;
};

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
  const [form, setForm] = useState<SettingsWorker>({
    ...worker,
    pincode: "",
    normalized_location: "",
    resolved_name: "",
    resolved_admin1: "",
    resolved_country: "",
    latitude: null,
    longitude: null,
    timezone: "Asia/Kolkata",
    ...worker,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ...worker,
      pincode: (worker as SettingsWorker).pincode ?? prev.pincode ?? "",
      normalized_location:
        (worker as SettingsWorker).normalized_location ??
        prev.normalized_location ??
        "",
      resolved_name:
        (worker as SettingsWorker).resolved_name ?? prev.resolved_name ?? "",
      resolved_admin1:
        (worker as SettingsWorker).resolved_admin1 ??
        prev.resolved_admin1 ??
        "",
      resolved_country:
        (worker as SettingsWorker).resolved_country ??
        prev.resolved_country ??
        "",
      latitude:
        (worker as SettingsWorker).latitude ?? prev.latitude ?? null,
      longitude:
        (worker as SettingsWorker).longitude ?? prev.longitude ?? null,
      timezone:
        (worker as SettingsWorker).timezone ?? prev.timezone ?? "Asia/Kolkata",
    }));
  }, [worker]);

  const updateField = <K extends keyof SettingsWorker>(
    key: K,
    value: SettingsWorker[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await onSave(form as WorkerProfile);
      setSuccess("Settings saved. Monitoring will now follow this saved location.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const hasResolvedLocation =
    !!form.normalized_location ||
    (!!form.latitude && !!form.longitude) ||
    !!form.resolved_name;

  return (
    <div className="min-h-screen bg-[#07111f] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Profile settings</h1>
            <p className="mt-2 text-slate-400">
              Update your work profile, plan, and saved monitoring location.
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

        {success ? (
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-emerald-300">
            {success}
          </div>
        ) : null}

        <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your name"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </Field>

            <Field label="City">
              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Mumbai"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </Field>

            <Field label="Zone / locality">
              <input
                value={form.zone}
                onChange={(e) => updateField("zone", e.target.value)}
                placeholder="Andheri"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </Field>

            <Field label="Pincode">
              <input
                value={form.pincode ?? ""}
                onChange={(e) => updateField("pincode", e.target.value)}
                placeholder="400053"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </Field>

            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Save a valid Indian city, area, and optional pincode. The backend
              geocodes this location and the monitoring engine follows the saved
              coordinates automatically.
            </div>

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
                options={[...LANGUAGE_OPTIONS]}
                value={form.language}
                onChange={(value) =>
                  updateField("language", value as WorkerProfile["language"])
                }
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
                onChange={(value) =>
                  updateField("plan", value as WorkerProfile["plan"])
                }
                columns={3}
              />
            </Field>
          </div>

          {hasResolvedLocation ? (
            <div className="mt-8 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
              <h2 className="text-xl font-semibold text-white">
                Saved monitoring location
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoRow
                  label="Normalized location"
                  value={form.normalized_location || "Not available yet"}
                />
                <InfoRow
                  label="Resolved place"
                  value={form.resolved_name || "Not available yet"}
                />
                <InfoRow
                  label="State / region"
                  value={form.resolved_admin1 || "Not available yet"}
                />
                <InfoRow
                  label="Country"
                  value={form.resolved_country || "India"}
                />
                <InfoRow
                  label="Latitude"
                  value={
                    form.latitude !== null && form.latitude !== undefined
                      ? String(form.latitude)
                      : "Not available yet"
                  }
                />
                <InfoRow
                  label="Longitude"
                  value={
                    form.longitude !== null && form.longitude !== undefined
                      ? String(form.longitude)
                      : "Not available yet"
                  }
                />
                <InfoRow
                  label="Timezone"
                  value={form.timezone || "Asia/Kolkata"}
                />
              </div>
            </div>
          ) : null}

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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#132640] px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
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
