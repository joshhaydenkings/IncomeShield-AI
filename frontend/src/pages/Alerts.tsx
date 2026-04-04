import { useState } from "react";
import {
  Bell,
  ShieldCheck,
  AlertTriangle,
  Activity,
  CloudRain,
  MapPin,
  Satellite,
} from "lucide-react";
import type { ScenarioKey } from "../services/mockData";
import { getEarnabilityLabel, tr } from "../services/translations";
import { useVoice } from "../hooks/useVoice";
import { useClaimData } from "../hooks/useClaimData";
import { buildAlertsVoice } from "../utils/pageVoice";
import { syncLiveScenario } from "../api/liveScenario";
import VoiceButton from "../components/common/VoiceButton";
import PageHeader from "../components/common/PageHeader";
import StatusPill from "../components/common/StatusPill";
import InfoCard from "../components/common/InfoCard";
import ScenarioSelector from "../components/common/ScenarioSelector";
import type { WorkerProfile } from "../types";

type AlertsProps = {
  worker: WorkerProfile;
  scenario: ScenarioKey;
  onScenarioChange: (scenario: ScenarioKey) => void;
  onGoToClaims: () => void;
  simpleMode: boolean;
};

function Alerts({
  worker,
  scenario,
  onScenarioChange,
  onGoToClaims,
  simpleMode,
}: AlertsProps) {
  const { speak } = useVoice(worker.language);
  const { data: claimData, loading, error } = useClaimData([scenario]);
  const [liveSyncMessage, setLiveSyncMessage] = useState("");
  const [syncing, setSyncing] = useState(false);

  if (loading || !claimData) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="rounded-3xl bg-[#0f1e33] px-8 py-6 text-slate-200 shadow-sm ring-1 ring-white/10">
          Loading alerts...
        </div>
      </div>
    );
  }

  const { claim } = claimData;
  const statusLabel = getEarnabilityLabel(worker.language, claim.score);

  const statusColor =
    claim.score >= 70
      ? "bg-emerald-500"
      : claim.score >= 35
        ? "bg-amber-500"
        : "bg-rose-500";

  const riskTone =
    claim.risk === "low"
      ? "good"
      : claim.risk === "medium"
        ? "warn"
        : "danger";

  const stormMode = claim.score < 35;

  const voiceText = buildAlertsVoice({
    simpleMode,
    worker,
    claim,
    statusLabel,
  });

  const handleLiveSync = async () => {
    try {
      setSyncing(true);
      setLiveSyncMessage("");
      const res = await syncLiveScenario();
      onScenarioChange(res.currentScenario as ScenarioKey);
      setLiveSyncMessage(
        `Live data synced using "${res.queryUsed}". Matched location: ${res.location.name}. ${res.reason}`
      );
    } catch (err) {
      setLiveSyncMessage("Could not sync live public data right now.");
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111f] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
            {error}
          </div>
        ) : null}

        {liveSyncMessage ? (
          <div className="mb-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4 text-cyan-300">
            {liveSyncMessage}
          </div>
        ) : null}

        <PageHeader
          title={simpleMode ? "Alerts" : "Live alerts"}
          actions={
            <>
              <VoiceButton
                label={tr(worker.language, "hearThis")}
                onClick={() => speak(voiceText)}
              />
              <button
                onClick={handleLiveSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 font-medium text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Satellite className="h-4 w-4" />
                {syncing ? "Syncing..." : "Use live data"}
              </button>
              <button
                onClick={onGoToClaims}
                className="rounded-2xl bg-white px-5 py-3 font-medium text-[#07111f] transition hover:bg-slate-200"
              >
                {tr(worker.language, "viewClaimStatus")}
              </button>
            </>
          }
        />

        {stormMode && (
          <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#10213a] to-[#0b1730] p-6 text-white shadow-sm ring-1 ring-white/10 md:p-8">
            <div className="text-sm uppercase tracking-wide text-slate-400">
              {tr(worker.language, "stormMode")}
            </div>
            <h2 className="mt-3 text-3xl font-bold">{claim.issue}</h2>
            <p className="mt-3 max-w-3xl text-slate-300">
              {simpleMode
                ? "Conditions are affecting work right now."
                : "Conditions are affecting work right now. Check your status before continuing."}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InfoCard
                label="Your area"
                value={worker.name}
                subtext={`${worker.city}, ${worker.zone}`}
                dark
                icon={<MapPin className="h-5 w-5" />}
              />
              <InfoCard
                label={tr(worker.language, "earnabilityIndex")}
                value={`${claim.score}/100`}
                subtext={statusLabel}
                dark
                icon={<Activity className="h-5 w-5" />}
              />
              <InfoCard
                label="Latest update"
                value={claim.workerMessage}
                dark
                icon={<Bell className="h-5 w-5" />}
              />
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm text-slate-400">Your status</div>
                  <div className="mt-2 text-3xl font-bold text-white">{worker.name}</div>
                  <div className="mt-2 text-slate-300">
                    {worker.city}, {worker.zone} • {worker.shift}
                  </div>
                </div>

                <div className="w-full max-w-xs rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="text-sm text-slate-400">
                    {simpleMode ? "Can you work now?" : tr(worker.language, "canYouEarnNow")}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full ${statusColor}`} />
                    <div className="text-2xl font-bold text-white">{statusLabel}</div>
                  </div>
                  <div className="mt-3 text-sm text-slate-400">
                    {tr(worker.language, "earnabilityIndex")}: {claim.score}/100
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                label={tr(worker.language, "currentCondition")}
                value={claim.issue}
                icon={<CloudRain className="h-5 w-5" />}
              />

              <div className="rounded-3xl bg-[#0f1e33] p-5 shadow-sm ring-1 ring-white/10">
                <div className="text-sm text-slate-400">{tr(worker.language, "riskLevel")}</div>
                <div className="mt-3">
                  <StatusPill
                    label={claim.risk.toUpperCase()}
                    tone={riskTone as "good" | "warn" | "danger"}
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-[#0f1e33] p-5 shadow-sm ring-1 ring-white/10 md:col-span-2">
                <div className="text-sm text-slate-400">Latest update</div>
                <div className="mt-3 text-2xl font-semibold text-white">
                  {claim.workerMessage}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <h2 className="text-2xl font-semibold text-white">
                Live conditions
              </h2>
              <p className="mt-2 text-slate-400">
                {simpleMode
                  ? "Use your saved location to sync real public data, or choose a condition manually."
                  : "Use your saved city and zone to sync real public data, or choose a condition manually."}
              </p>

              <div className="mt-6">
                <ScenarioSelector value={scenario} onChange={onScenarioChange} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <InfoCard
              label="Protection status"
              value={claim.workerMessage}
              subtext="Latest update"
              dark
              icon={<ShieldCheck className="h-5 w-5" />}
            />

            <InfoCard
              label="Monitoring"
              value={simpleMode ? "Live tracking" : "Live scenario tracking"}
              subtext={
                simpleMode
                  ? "Alerts change with conditions."
                  : "Alerts update with the current condition."
              }
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;