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
} from "lucide-react";
import { useAdminReview } from "../hooks/useAdminReview";
import { buildAdminVoice } from "../utils/pageVoice";
import { useVoice } from "../hooks/useVoice";
import PageHeader from "../components/common/PageHeader";
import StatusPill from "../components/common/StatusPill";
import InfoCard from "../components/common/InfoCard";
import VoiceButton from "../components/common/VoiceButton";
import type { WorkerProfile } from "../types";
import type { ScenarioKey } from "../services/mockData";

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
  const { speak } = useVoice(worker.language);

  if (loading || !review) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#07111f]">
        <div className="rounded-3xl bg-[#0f1e33] px-8 py-6 text-slate-200 shadow-sm ring-1 ring-white/10">
          Loading admin review...
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
                {review.reasons.map((reason, index) => (
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

export default Admin;