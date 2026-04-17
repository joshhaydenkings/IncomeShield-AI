import {
  ShieldAlert,
  ShieldCheck,
  MapPinned,
  Smartphone,
  Radar,
  Route,
  FileSearch,
  Wallet,
  ArrowLeft,
  Brain,
  Cpu,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { useAdminReview } from "../hooks/useAdminReview";
import { buildAdminVoice } from "../utils/pageVoice";
import { useVoice } from "../hooks/useVoice";
import { useClaimData } from "../hooks/useClaimData";
import { useClaimHistory } from "../hooks/useClaimHistory";
import PageHeader from "../components/common/PageHeader";
import StatusPill from "../components/common/StatusPill";
import InfoCard from "../components/common/InfoCard";
import VoiceButton from "../components/common/VoiceButton";
import type { WorkerProfile } from "../types";
import type { ScenarioKey } from "../services/mockData";
import MonitoringAdminPanel from "../components/MonitoringAdminPanel";

type AdminProps = {
  worker: WorkerProfile;
  scenario: ScenarioKey;
  onBackToDashboard: () => void;
  simpleMode: boolean;
};

function Admin({
  worker,
  scenario,
  onBackToDashboard,
  simpleMode,
}: AdminProps) {
  const { data: review, loading, error } = useAdminReview([scenario]);
  const { data: claimData } = useClaimData([scenario]);
  const { items: history } = useClaimHistory([scenario]);
  const { speak } = useVoice(worker.language);

  const currentClaim = claimData?.claim;
  const latestHistory = history[0];

  const aiInsight = currentClaim?.aiInsight as
    | {
        predictedRisk?: string;
        predictedFraud?: boolean;
        inputSummary?: string;
        modelSource?: string;
        trainedAt?: string;
        riskModelSource?: string;
        riskTrainedAt?: string;
        fraudModelSource?: string;
        fraudTrainedAt?: string;
        fraudProbability?: number;
        fraudDecision?: string;
        fraudSignals?: {
          claim_count_7d?: number;
          gps_jump_score?: number;
          device_change_count_30d?: number;
          signal_match_score?: number;
          trust_score?: number;
          platform_inactivity_minutes?: number;
          zone_risk_score?: number;
        };
      }
    | undefined;

  const fraudProbabilityPct = aiInsight?.fraudProbability != null
    ? `${(aiInsight.fraudProbability * 100).toFixed(1)}%`
    : "N/A";

  const fraudDecision = aiInsight?.fraudDecision
    ? aiInsight.fraudDecision === "manual_review"
      ? "Manual review"
      : "Auto process"
    : currentClaim?.fraudFlag
      ? "Manual review"
      : "Auto process";

  const riskModelLabel =
    aiInsight?.riskModelSource === "trained_model" ||
    aiInsight?.modelSource === "trained_model"
      ? "Trained model"
      : "Fallback rules";

  const fraudModelLabel =
    aiInsight?.fraudModelSource === "trained_model"
      ? "Trained model"
      : "Fallback rules";

  const isInitialLoading = loading && !review && !error;

  if (isInitialLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#07111f]">
        <div className="rounded-3xl bg-[#0f1e33] px-8 py-6 text-slate-200 shadow-sm ring-1 ring-white/10">
          Loading admin review...
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-[#07111f] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            title={simpleMode ? "Admin review" : "Fraud and payout control center"}
            actions={
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            }
          />

          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
            {error || "Admin review data is unavailable right now."}
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <InfoCard
              label="Worker"
              value={worker.name}
              subtext={`${worker.city}, ${worker.zone}`}
              icon={<MapPinned className="h-5 w-5" />}
            />
            <InfoCard
              label="Scenario"
              value={scenario}
              subtext="Review request"
              icon={<FileSearch className="h-5 w-5" />}
            />
          </div>

          <MonitoringAdminPanel />
        </div>
      </div>
    );
  }

  const fraudTone = review.fraudStatus === "Elevated" ? "danger" : "good";

  const payoutTone =
    review.payoutStatus === "approved"
      ? "good"
      : review.payoutStatus === "checking"
        ? "warn"
        : review.payoutStatus === "review"
          ? "danger"
          : review.payoutStatus === "paid"
            ? "good"
            : "default";

  const gpsTone = review.gpsStatus === "Mismatch" ? "danger" : "good";
  const deviceTone = review.deviceStatus === "Unusual" ? "danger" : "good";
  const clusterTone =
    review.clusterRisk === "Possible ring pattern" ? "danger" : "good";

  const voiceText = buildAdminVoice({
    simpleMode,
    workerName: worker.name,
    reviewType: review.reviewType,
    fraudStatus: review.fraudStatus,
    payoutRoute: review.payoutRoute,
    reasons: review.reasons,
  });

  const fraudSignals = aiInsight?.fraudSignals;

  return (
    <div className="min-h-screen bg-[#07111f] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
            {error}
          </div>
        ) : null}

        <PageHeader
          title={simpleMode ? "Admin review" : "Fraud and payout control center"}
          actions={
            <>
              <VoiceButton label="Hear this" onClick={() => speak(voiceText)} />
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                label="Worker"
                value={worker.name}
                subtext={`${worker.city}, ${worker.zone}`}
                icon={<MapPinned className="h-5 w-5" />}
              />
              <InfoCard
                label="Scenario"
                value={review.reviewType}
                subtext={simpleMode ? "Current review" : "Current review context"}
                icon={<FileSearch className="h-5 w-5" />}
              />
              <InfoCard
                label="Fraud status"
                value={review.fraudStatus}
                subtext={simpleMode ? "Risk check" : "Overall claim risk assessment"}
                icon={<ShieldAlert className="h-5 w-5" />}
                dark={review.fraudStatus === "Elevated"}
              />
              <InfoCard
                label="Payout route"
                value={review.payoutRoute}
                subtext={simpleMode ? "Current route" : "Current routing"}
                icon={<Wallet className="h-5 w-5" />}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoCard
                label="Fraud probability"
                value={fraudProbabilityPct}
                subtext="ML fraud confidence"
                icon={<AlertTriangle className="h-5 w-5" />}
              />
              <InfoCard
                label="Fraud decision"
                value={fraudDecision}
                subtext="Review routing"
                icon={<ShieldAlert className="h-5 w-5" />}
              />
              <InfoCard
                label="Risk model"
                value={riskModelLabel}
                subtext="Risk prediction engine"
                icon={<Brain className="h-5 w-5" />}
              />
              <InfoCard
                label="Fraud model"
                value={fraudModelLabel}
                subtext="Fraud detection engine"
                icon={<Bot className="h-5 w-5" />}
              />
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-white">
                  {simpleMode ? "Checks" : "Verification signals"}
                </h2>
                <StatusPill
                  label={review.fraudStatus}
                  tone={fraudTone as "good" | "danger"}
                />
              </div>

              <div className="space-y-4">
                <SignalRow
                  icon={<Route className="h-5 w-5" />}
                  label="GPS vs network location"
                  value={review.gpsStatus}
                  tone={gpsTone as "good" | "danger"}
                />
                <SignalRow
                  icon={<Smartphone className="h-5 w-5" />}
                  label="Device behavior"
                  value={review.deviceStatus}
                  tone={deviceTone as "good" | "danger"}
                />
                <SignalRow
                  icon={<ShieldCheck className="h-5 w-5" />}
                  label="Trust score"
                  value={review.trustScore}
                  tone={
                    review.trustScore === "42 / 100"
                      ? "danger"
                      : review.trustScore === "76 / 100"
                        ? "warn"
                        : "good"
                  }
                />
                <SignalRow
                  icon={<Radar className="h-5 w-5" />}
                  label="Cluster fraud risk"
                  value={review.clusterRisk}
                  tone={clusterTone as "good" | "danger"}
                />
                <SignalRow
                  icon={<Wallet className="h-5 w-5" />}
                  label="Claim status"
                  value={review.claimStatusLabel}
                  tone={payoutTone as "default" | "good" | "warn" | "danger"}
                />
              </div>
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-cyan-300" />
                <h2 className="text-2xl font-semibold text-white">
                  {simpleMode ? "Fraud signals" : "Detailed fraud signals"}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SignalValueCard
                  label="Claim count (7d)"
                  value={String(fraudSignals?.claim_count_7d ?? "-")}
                />
                <SignalValueCard
                  label="GPS jump score"
                  value={
                    fraudSignals?.gps_jump_score != null
                      ? fraudSignals.gps_jump_score.toFixed(2)
                      : "-"
                  }
                />
                <SignalValueCard
                  label="Device changes (30d)"
                  value={String(fraudSignals?.device_change_count_30d ?? "-")}
                />
                <SignalValueCard
                  label="Signal match score"
                  value={
                    fraudSignals?.signal_match_score != null
                      ? fraudSignals.signal_match_score.toFixed(2)
                      : "-"
                  }
                />
                <SignalValueCard
                  label="Trust score"
                  value={
                    fraudSignals?.trust_score != null
                      ? fraudSignals.trust_score.toFixed(2)
                      : "-"
                  }
                />
                <SignalValueCard
                  label="Zone risk score"
                  value={
                    fraudSignals?.zone_risk_score != null
                      ? fraudSignals.zone_risk_score.toFixed(2)
                      : "-"
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-white">
                  {simpleMode ? "Why this happened" : "Why this case looks this way"}
                </h2>
                <StatusPill
                  label={review.reviewerRecommendation}
                  tone={review.fraudStatus === "Elevated" ? "danger" : "good"}
                />
              </div>

              <div className="space-y-3">
                {currentClaim?.reasons?.length
                  ? currentClaim.reasons.map((reason, index) => (
                      <div
                        key={index}
                        className={`rounded-2xl p-4 ${
                          review.fraudStatus === "Elevated"
                            ? "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20"
                            : "bg-white/5 text-slate-300 ring-1 ring-white/10"
                        }`}
                      >
                        {reason}
                      </div>
                    ))
                  : review.reasons.map((reason, index) => (
                      <div
                        key={index}
                        className={`rounded-2xl p-4 ${
                          review.fraudStatus === "Elevated"
                            ? "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20"
                            : "bg-white/5 text-slate-300 ring-1 ring-white/10"
                        }`}
                      >
                        {reason}
                      </div>
                    ))}
              </div>
            </div>

            <InfoCard
              label="Latest payout record"
              value={latestHistory?.payoutReference || "No payout yet"}
              subtext={latestHistory?.payoutChannel || "Awaiting release"}
              dark
              icon={<Wallet className="h-5 w-5" />}
            />

            <InfoCard
              label="Anti-fraud layer"
              value={
                simpleMode
                  ? "Checks for fraud"
                  : "Fast for honest workers, hard on fraud"
              }
              subtext={
                simpleMode
                  ? "Signals and routing stay updated."
                  : "Signals, trust score, and routing stay aligned with the latest case status."
              }
              dark
              icon={<ShieldAlert className="h-5 w-5" />}
            />
          </div>
        </div>

        <div className="mt-8">
          <MonitoringAdminPanel />
        </div>
      </div>
    </div>
  );
}

type SignalRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "good" | "warn" | "danger";
};

function SignalRow({ icon, label, value, tone = "default" }: SignalRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-center gap-3">
        <div className="text-slate-400">{icon}</div>
        <div>
          <div className="text-sm text-slate-400">{label}</div>
          <div className="mt-1 text-sm font-medium text-white">{value}</div>
        </div>
      </div>

      <StatusPill label={value} tone={tone} />
    </div>
  );
}

function SignalValueCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

export default Admin;