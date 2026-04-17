import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Wallet,
  AlertTriangle,
  Sparkles,
  Brain,
  ShieldAlert,
  Cpu,
  Bot,
} from "lucide-react";
import { useClaimData } from "../hooks/useClaimData";
import { useClaimHistory } from "../hooks/useClaimHistory";
import { releasePayout, submitManualClaim } from "../api/claims";
import { tr } from "../services/translations";
import { useVoice } from "../hooks/useVoice";
import { buildClaimsVoice } from "../utils/pageVoice";
import VoiceButton from "../components/common/VoiceButton";
import PageHeader from "../components/common/PageHeader";
import StatusPill from "../components/common/StatusPill";
import type { WorkerProfile } from "../types";

type ClaimsProps = {
  worker: WorkerProfile;
  scenario: string;
  simpleMode: boolean;
};

function Claims({ worker, scenario, simpleMode }: ClaimsProps) {
  const { speak } = useVoice(worker.language);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading, error } = useClaimData([scenario, refreshKey]);
  const {
    items: history,
    loading: historyLoading,
    error: historyError,
  } = useClaimHistory([scenario, refreshKey]);

  const [manualReason, setManualReason] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualMessage, setManualMessage] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);

  const currentClaim = data?.claim;
  const currentPlan = data?.planInfo;

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
      }
    | undefined;

  const fraudTone = currentClaim?.fraudFlag ? "danger" : "good";

  const payoutTone =
    currentClaim?.payoutStatus === "approved"
      ? "good"
      : currentClaim?.payoutStatus === "checking"
        ? "warn"
        : currentClaim?.payoutStatus === "review"
          ? "danger"
          : currentClaim?.payoutStatus === "paid"
            ? "good"
            : "default";

  const riskTone =
    currentClaim?.risk === "high"
      ? "danger"
      : currentClaim?.risk === "medium"
        ? "warn"
        : "good";

  const modelActive =
    aiInsight?.riskModelSource === "trained_model" ||
    aiInsight?.fraudModelSource === "trained_model" ||
    aiInsight?.modelSource === "trained_model";

  const latestHistoryItem = history[0];
  const canReleasePayout =
    !!latestHistoryItem &&
    (latestHistoryItem.lifecycleStatus === "approved" ||
      latestHistoryItem.payoutStatus === "approved");

  const voiceText = useMemo(() => {
    if (!currentClaim || !currentPlan) return "";
    return buildClaimsVoice({
      simpleMode,
      worker,
      claim: currentClaim,
      planInfo: currentPlan,
      payoutText: `₹${currentClaim.payout}`,
    });
  }, [simpleMode, worker, currentClaim, currentPlan]);

  const refreshPageData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleManualClaim = async () => {
    if (!manualReason.trim()) {
      setManualMessage("Please enter a reason before submitting.");
      return;
    }

    try {
      setManualLoading(true);
      const res = await submitManualClaim(manualReason.trim());
      setManualMessage(res.message);
      if (!res.duplicateBlocked) {
        setManualReason("");
        refreshPageData();
      }
    } catch (err) {
      setManualMessage(err instanceof Error ? err.message : "Failed to submit manual claim.");
    } finally {
      setManualLoading(false);
    }
  };

  const handleReleasePayout = async () => {
    try {
      setPayoutLoading(true);
      setManualMessage("");
      const res = await releasePayout(latestHistoryItem?.id);
      setManualMessage(
        `${res.message} Reference: ${res.payoutReference || "Generated"}`
      );
      refreshPageData();
    } catch (err) {
      setManualMessage(err instanceof Error ? err.message : "Failed to release payout.");
    } finally {
      setPayoutLoading(false);
    }
  };

  if (loading || !currentClaim || !currentPlan) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="rounded-3xl bg-[#0f1e33] px-8 py-6 text-slate-200 shadow-sm ring-1 ring-white/10">
          Loading claims...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title={simpleMode ? "Claims" : "Claims and payout"}
          actions={
            <VoiceButton
              label={tr(worker.language, "hearThis")}
              onClick={() => speak(voiceText)}
            />
          }
        />

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
            {error}
          </div>
        ) : null}

        {historyError ? (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
            {historyError}
          </div>
        ) : null}

        {manualMessage ? (
          <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4 text-cyan-300">
            {manualMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Payout status"
                value={capitalize(currentClaim.payoutStatus)}
                icon={<Wallet className="h-5 w-5" />}
              />
              <StatCard
                label="Estimated payout"
                value={`₹${currentClaim.payout}`}
                icon={<Wallet className="h-5 w-5" />}
              />
              <StatCard
                label="Fraud check"
                value={currentClaim.fraudFlag ? "Review" : "Normal"}
                icon={<AlertTriangle className="h-5 w-5" />}
              />
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-emerald-300" />
                  <h2 className="text-2xl font-semibold text-white">
                    {simpleMode ? "AI details" : "AI decision details"}
                  </h2>
                </div>
                <StatusPill
                  label={modelActive ? "Model active" : "Fallback safe mode"}
                  tone={modelActive ? "good" : "warn"}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InsightCard
                  label="Risk model"
                  value={
                    aiInsight?.riskModelSource === "trained_model" ||
                    aiInsight?.modelSource === "trained_model"
                      ? "Trained model"
                      : "Fallback rules"
                  }
                  tone={modelActive ? "good" : "warn"}
                  icon={<Brain className="h-5 w-5" />}
                />
                <InsightCard
                  label="Risk prediction"
                  value={currentClaim.aiInsight?.predictedRisk || currentClaim.risk}
                  tone={riskTone}
                  icon={<Cpu className="h-5 w-5" />}
                />
                <InsightCard
                  label="Risk score"
                  value={`${currentClaim.score}/100`}
                  tone={riskTone}
                  icon={<Cpu className="h-5 w-5" />}
                />
                <InsightCard
                  label="Fraud model"
                  value={
                    aiInsight?.fraudModelSource === "trained_model"
                      ? "Trained model"
                      : "Fallback rules"
                  }
                  tone={modelActive ? "good" : "warn"}
                  icon={<Bot className="h-5 w-5" />}
                />
                <InsightCard
                  label="Fraud review flag"
                  value={currentClaim.aiInsight?.predictedFraud ? "Yes" : "No"}
                  tone={currentClaim.aiInsight?.predictedFraud ? "danger" : "good"}
                  icon={<ShieldAlert className="h-5 w-5" />}
                />
                <InsightCard
                  label="Decision path"
                  value={currentClaim.fraudFlag ? "Manual review" : "Auto process"}
                  tone={currentClaim.fraudFlag ? "danger" : "good"}
                  icon={<ShieldAlert className="h-5 w-5" />}
                />
              </div>

              <div className="mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-sm text-slate-400">Model input summary</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {currentClaim.aiInsight?.inputSummary || "No input summary"}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-sm text-slate-400">Risk model status</div>
                  <div className="mt-2 text-white">
                    {aiInsight?.riskModelSource === "trained_model"
                      ? "Using trained risk model for live claim scoring."
                      : "Using safe fallback risk logic."}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-sm text-slate-400">Fraud model status</div>
                  <div className="mt-2 text-white">
                    {aiInsight?.fraudModelSource === "trained_model"
                      ? "Using trained fraud model for review routing."
                      : "Using safe fallback fraud logic."}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-white">Simulated instant payout</h2>
                <StatusPill label="UPI simulator" tone="good" />
              </div>

              <div className="text-slate-300">
                Release an approved payout instantly through the simulated UPI payout gateway.
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleReleasePayout}
                  disabled={!canReleasePayout || payoutLoading}
                  className="rounded-2xl bg-white px-5 py-3 font-semibold text-[#07111f] transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {payoutLoading ? "Processing..." : "Release payout"}
                </button>

                <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300 ring-1 ring-white/10">
                  {canReleasePayout
                    ? "An approved claim is ready for simulated payout."
                    : "Payout release becomes available after claim approval."}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-white">Manual claim fallback</h2>
                <StatusPill label="Optional" tone="default" />
              </div>

              <div className="text-slate-300">
                If automatic detection missed your disruption, you can request a manual claim review here.
              </div>

              <textarea
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                placeholder="Describe what affected your work and earnings..."
                className="mt-4 min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />

              <button
                onClick={handleManualClaim}
                disabled={manualLoading}
                className="mt-4 rounded-2xl bg-white px-5 py-3 font-semibold text-[#07111f] transition hover:bg-slate-200 disabled:opacity-60"
              >
                {manualLoading ? "Submitting..." : "Request claim review"}
              </button>
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-white">Why this decision was made</h2>
                <StatusPill
                  label={currentClaim.fraudFlag ? "Needs review" : "Safe for fast support"}
                  tone={fraudTone as "good" | "danger"}
                />
              </div>

              <div className="space-y-3">
                {currentClaim.reasons.map((reason, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-white/5 px-4 py-3 text-slate-300 ring-1 ring-white/10"
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-white">Current claim lifecycle</h2>
                <StatusPill
                  label={capitalize(currentClaim.payoutStatus)}
                  tone={payoutTone as "default" | "good" | "warn" | "danger"}
                />
              </div>

              {historyLoading ? (
                <div className="text-slate-400">Loading lifecycle...</div>
              ) : history.length === 0 ? (
                <div className="rounded-2xl bg-white/5 p-4 text-slate-300 ring-1 ring-white/10">
                  No claim history yet.
                </div>
              ) : (
                <ClaimTimeline timeline={history[0].timeline} />
              )}

              {history[0]?.payoutReference ? (
                <div className="mt-5 rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
                  <div className="text-sm text-emerald-300">Payout reference</div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {history[0].payoutReference}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    Channel: {history[0].payoutChannel || "UPI Simulator"}
                  </div>
                </div>
              ) : null}

              {history[0]?.duplicateBlocked ? (
                <div className="mt-5 rounded-2xl bg-amber-500/10 p-4 ring-1 ring-amber-500/20">
                  <div className="text-sm text-amber-300">Duplicate protection</div>
                  <div className="mt-1 text-slate-200">
                    A duplicate claim was blocked to avoid repeated payouts for the same recent disruption.
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                <h2 className="text-2xl font-semibold text-white">Claim history</h2>
              </div>

              {historyLoading ? (
                <div className="text-slate-400">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="rounded-2xl bg-white/5 p-4 text-slate-300 ring-1 ring-white/10">
                  No claim history yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold text-white">{item.issue}</div>
                          <div className="mt-1 text-sm text-slate-400">
                            {item.claimNumber} • {item.planName} • {item.scenario}
                          </div>
                        </div>

                        <StatusPill
                          label={capitalize(item.lifecycleStatus || item.payoutStatus)}
                          tone={
                            item.lifecycleStatus === "approved" || item.lifecycleStatus === "paid"
                              ? "good"
                              : item.lifecycleStatus === "checking"
                                ? "warn"
                                : item.lifecycleStatus === "review"
                                  ? "danger"
                                  : "default"
                          }
                        />
                      </div>

                      <div className="mt-3 text-slate-300">{item.workerMessage}</div>

                      {item.manualTrigger ? (
                        <div className="mt-3 rounded-xl bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300 ring-1 ring-cyan-500/20">
                          Manual claim request
                          {item.manualReason ? ` • ${item.manualReason}` : ""}
                        </div>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                        <span>Payout: ₹{item.payout}</span>
                        {item.payoutReference ? <span>Reference: {item.payoutReference}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-[#0f1e33] p-5 shadow-sm ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-slate-300">{icon}</div>
      </div>
      <div className="mt-3 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function InsightCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "danger";
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-slate-300">{icon}</div>
      </div>
      <div className="mt-3">
        <StatusPill label={capitalize(value)} tone={tone} />
      </div>
    </div>
  );
}

function ClaimTimeline({
  timeline,
}: {
  timeline: { label: string; status: string; time?: string | null }[];
}) {
  return (
    <div className="space-y-3">
      {timeline.map((stage, index) => (
        <div
          key={`${stage.label}-${index}`}
          className="flex items-start gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
        >
          <div
            className={`mt-1 h-3 w-3 rounded-full ${
              stage.status === "done"
                ? "bg-emerald-400"
                : stage.status === "pending"
                  ? "bg-amber-400"
                  : "bg-slate-500"
            }`}
          />
          <div>
            <div className="font-medium text-white">{stage.label}</div>
            <div className="mt-1 text-sm text-slate-400">{capitalize(stage.status)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function capitalize(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default Claims;