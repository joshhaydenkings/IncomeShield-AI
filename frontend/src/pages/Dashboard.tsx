import { useMemo } from "react";
import {
  Wallet,
  ShieldCheck,
  MapPin,
  Globe,
  Briefcase,
  AlertTriangle,
  Activity,
  ArrowRight,
  Clock3,
  CloudSun,
} from "lucide-react";
import type { ScenarioKey } from "../services/mockData";
import {
  getEarnabilityLabel,
  getPayoutStatusText,
  tr,
} from "../services/translations";
import { useVoice } from "../hooks/useVoice";
import { useClaimData } from "../hooks/useClaimData";
import { useActivity } from "../hooks/useActivity";
import { buildDashboardVoice } from "../utils/pageVoice";
import VoiceButton from "../components/common/VoiceButton";
import PageHeader from "../components/common/PageHeader";
import StatusPill from "../components/common/StatusPill";
import InfoCard from "../components/common/InfoCard";
import type { WorkerProfile } from "../types";

type DashboardProps = {
  worker: WorkerProfile;
  scenario: ScenarioKey;
  onScenarioChange: (scenario: ScenarioKey) => void;
  onBack: () => void;
  onGoToPlans: () => void;
  onGoToAdmin: () => void;
  simpleMode: boolean;
};

function Dashboard({
  worker,
  scenario,
  onBack,
  onGoToPlans,
  onGoToAdmin,
  simpleMode,
}: DashboardProps) {
  const { speak } = useVoice(worker.language);
  const { data: claimData, loading, error } = useClaimData([scenario]);
  const { items: activityItems } = useActivity([scenario, worker.plan]);

  const claim = claimData?.claim;
  const planInfo = claimData?.planInfo;

  const statusLabel = useMemo(() => {
    if (!claim) return "";
    return getEarnabilityLabel(worker.language, claim.score);
  }, [claim, worker.language]);

  const statusTone = useMemo(() => {
    if (!claim) return "default";
    if (claim.score >= 70) return "good";
    if (claim.score >= 35) return "warn";
    return "danger";
  }, [claim]);

  const statusColor = useMemo(() => {
    if (!claim) return "bg-slate-500";
    if (claim.score >= 70) return "bg-emerald-500";
    if (claim.score >= 35) return "bg-amber-500";
    return "bg-rose-500";
  }, [claim]);

  const payoutText = useMemo(() => {
    if (!claim) return "";
    return getPayoutStatusText(worker.language, claim.payoutStatus);
  }, [claim, worker.language]);

  const payoutTone = useMemo(() => {
    if (!claim) return "default";
    if (claim.payoutStatus === "approved") return "good";
    if (claim.payoutStatus === "checking") return "warn";
    if (claim.payoutStatus === "review") return "danger";
    return "default";
  }, [claim]);

  const nextAction = useMemo(() => {
    if (!claim) {
      return {
        title: simpleMode ? "Check status" : "Check your status",
        body: simpleMode
          ? "See your current work and payout status."
          : "Refresh your current work conditions and payout status.",
      };
    }

    if (claim.fraudFlag || claim.payoutStatus === "review") {
      return {
        title: "Wait for review",
        body: simpleMode
          ? "Review is needed before payout."
          : "This case needs verification before any payout can move forward.",
      };
    }

    if (claim.payoutStatus === "approved") {
      return {
        title: simpleMode ? "Track payout" : "Pause and track payout",
        body: simpleMode
          ? "Your payout is approved. Check updates."
          : "Your payout is approved. Avoid unnecessary risk and monitor updates.",
      };
    }

    if (scenario === "flood") {
      return {
        title: simpleMode ? "Avoid this area" : "Avoid this area for now",
        body: simpleMode
          ? "Flooding is affecting work."
          : "Conditions are severely affecting work. Wait before heading back out.",
      };
    }

    if (scenario === "rain") {
      return {
        title: simpleMode ? "Reduce trips" : "Reduce exposure",
        body: simpleMode
          ? "Rain may slow deliveries."
          : "Take shorter trips and avoid unnecessary movement until conditions improve.",
      };
    }

    if (scenario === "aqi") {
      return {
        title: simpleMode ? "Limit outdoor work" : "Limit outdoor time",
        body: simpleMode
          ? "Air quality is unsafe."
          : "Air quality is unsafe. Reduce long outdoor work where possible.",
      };
    }

    if (scenario === "outage") {
      return {
        title: simpleMode ? "Wait for app recovery" : "Hold and monitor orders",
        body: simpleMode
          ? "Orders may be delayed."
          : "Order flow is disrupted right now. Wait for the platform to stabilize.",
      };
    }

    return {
      title: simpleMode ? "Keep working" : "Continue working normally",
      body: simpleMode
        ? "Conditions look normal."
        : "Conditions look stable right now. Keep tracking updates as needed.",
    };
  }, [claim, scenario, simpleMode]);

  const shiftOutlook = useMemo(() => {
    const shift = worker.shift;

    if (scenario === "flood") {
      return {
        title: simpleMode ? "High risk" : "High disruption likely",
        detail: simpleMode
          ? `${shift}: Work may be heavily affected.`
          : `${shift}: Travel and order flow may stay heavily affected.`,
        tone: "danger" as const,
      };
    }

    if (scenario === "rain") {
      return {
        title: simpleMode ? "Medium risk" : "Moderate disruption likely",
        detail: simpleMode
          ? `${shift}: Delays may continue.`
          : `${shift}: Delays may continue for part of your shift.`,
        tone: "warn" as const,
      };
    }

    if (scenario === "aqi") {
      return {
        title: simpleMode ? "Outdoor risk" : "Outdoor risk remains elevated",
        detail: simpleMode
          ? `${shift}: Limit outdoor exposure.`
          : `${shift}: Limit long outdoor exposure where possible.`,
        tone: "warn" as const,
      };
    }

    if (scenario === "outage") {
      return {
        title: simpleMode ? "Recovery may be slow" : "Order flow may recover slowly",
        detail: simpleMode
          ? `${shift}: Wait for app recovery.`
          : `${shift}: Watch for platform recovery before moving zones.`,
        tone: "warn" as const,
      };
    }

    if (scenario === "gps_spoof") {
      return {
        title: simpleMode ? "Review in progress" : "Account review in progress",
        detail: simpleMode
          ? `${shift}: Wait for review to finish.`
          : `${shift}: Wait until the review is cleared before depending on payouts.`,
        tone: "danger" as const,
      };
    }

    return {
      title: simpleMode ? "Stable" : "Stable shift outlook",
      detail: simpleMode
        ? `${shift}: Conditions look normal.`
        : `${shift}: Conditions look normal for your next working window.`,
      tone: "good" as const,
    };
  }, [scenario, worker.shift, simpleMode]);

  if (loading || !claim || !planInfo) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="rounded-3xl bg-[#0f1e33] px-8 py-6 text-slate-200 shadow-sm ring-1 ring-white/10">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const voiceText = buildDashboardVoice({
    worker,
    simpleMode,
    statusLabel,
    payoutText,
    nextActionTitle: nextAction.title,
    nextActionBody: nextAction.body,
    shiftOutlookTitle: shiftOutlook.title,
    shiftOutlookDetail: shiftOutlook.detail,
    claim,
    planInfo,
    activityItems,
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
          title={`Welcome, ${worker.name}`}
          actions={
            <>
              <VoiceButton
                label={tr(worker.language, "hearThis")}
                onClick={() => speak(voiceText)}
              />
              <button
                onClick={onGoToPlans}
                className="rounded-2xl bg-white px-5 py-3 font-medium text-[#07111f] transition hover:bg-slate-200"
              >
                {tr(worker.language, "viewPlans")}
              </button>
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-2 text-sm font-medium text-slate-400">
                {tr(worker.language, "earnabilityIndex")}
              </div>

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-end gap-4">
                    <div className="text-6xl font-bold tracking-tight text-white">
                      {claim.score}
                    </div>
                    <div className="mb-2">
                      <StatusPill
                        label={statusLabel}
                        tone={statusTone as "default" | "good" | "warn" | "danger"}
                      />
                    </div>
                  </div>

                  <h2 className="mt-5 text-3xl font-bold text-white">
                    {simpleMode
                      ? "Can you work now?"
                      : tr(worker.language, "canYouEarnNow")}
                  </h2>

                  <p className="mt-3 max-w-2xl text-lg text-slate-300">
                    {claim.issue}
                  </p>
                </div>

                <div className="w-full max-w-xs rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="text-sm text-slate-400">
                    {tr(worker.language, "liveScore")}
                  </div>
                  <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full ${statusColor} transition-all duration-500`}
                      style={{ width: `${claim.score}%` }}
                    />
                  </div>
                  <div className="mt-3 text-sm text-slate-400">
                    {simpleMode
                      ? "This shows how easy it is to work now."
                      : "This score shows how possible it is to earn right now."}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#13233b] to-[#0d1b2e] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-400">
                    {simpleMode ? "Next step" : "Next best action"}
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {nextAction.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-slate-300">
                    {nextAction.body}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-slate-200">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InfoCard
                label={tr(worker.language, "weeklyPlan")}
                value={planInfo.name}
                subtext={planInfo.badge}
                icon={<ShieldCheck className="h-5 w-5" />}
              />
              <InfoCard
                label={tr(worker.language, "youPay")}
                value={`₹${planInfo.premium}/week`}
                subtext="Weekly premium"
                icon={<Wallet className="h-5 w-5" />}
              />
              <InfoCard
                label={tr(worker.language, "protectedUpTo")}
                value={`₹${planInfo.protection}`}
                subtext="Maximum support"
                icon={<ShieldCheck className="h-5 w-5" />}
              />
              <InfoCard
                label={tr(worker.language, "payoutStatus")}
                value={payoutText}
                subtext={claim.payout > 0 ? `₹${claim.payout} estimated` : "No payout"}
                icon={<Activity className="h-5 w-5" />}
              />
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-semibold text-white">Your profile</h3>
                <StatusPill
                  label={
                    claim.fraudFlag
                      ? tr(worker.language, "needsReview")
                      : tr(worker.language, "normal")
                  }
                  tone={claim.fraudFlag ? "danger" : "good"}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InfoCard
                  label={tr(worker.language, "city")}
                  value={worker.city}
                  icon={<MapPin className="h-5 w-5" />}
                />
                <InfoCard
                  label={tr(worker.language, "zone")}
                  value={worker.zone}
                  icon={<MapPin className="h-5 w-5" />}
                />
                <InfoCard
                  label={tr(worker.language, "shift")}
                  value={worker.shift}
                  icon={<Activity className="h-5 w-5" />}
                />
                <InfoCard
                  label="Your work"
                  value={worker.workerType}
                  icon={<Briefcase className="h-5 w-5" />}
                />
                <InfoCard
                  label={tr(worker.language, "language")}
                  value={worker.language.toUpperCase()}
                  icon={<Globe className="h-5 w-5" />}
                />
                <InfoCard
                  label={tr(worker.language, "fraudCheck")}
                  value={
                    claim.fraudFlag
                      ? tr(worker.language, "needsReview")
                      : tr(worker.language, "normal")
                  }
                  dark
                  icon={<AlertTriangle className="h-5 w-5" />}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onGoToAdmin}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
              >
                Admin for demo
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0d1b2e] p-6 text-white shadow-sm ring-1 ring-white/10">
              <h3 className="text-xl font-semibold text-white">
                {simpleMode ? "Payout status" : "Current payout state"}
              </h3>
              <div className="mt-4">
                <StatusPill
                  label={payoutText}
                  tone={payoutTone as "default" | "good" | "warn" | "danger"}
                />
              </div>
              <p className="mt-4 text-slate-300">{claim.workerMessage}</p>
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10">
              <div className="mb-4 flex items-center gap-2 text-slate-300">
                <Clock3 className="h-5 w-5" />
                <h3 className="text-xl font-semibold text-white">
                  Recent activity
                </h3>
              </div>

              <div className="space-y-4">
                {activityItems.length > 0 ? (
                  activityItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-white">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-400">{item.time}</div>
                      </div>
                      <div className="mt-2 text-sm text-slate-300">
                        {item.detail}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-400 ring-1 ring-white/10">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10">
              <div className="mb-4 flex items-center gap-2 text-slate-300">
                <CloudSun className="h-5 w-5" />
                <h3 className="text-xl font-semibold text-white">
                  {simpleMode ? "Next shift" : "Next shift outlook"}
                </h3>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">
                    {shiftOutlook.title}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {shiftOutlook.detail}
                  </div>
                </div>
                <StatusPill
                  label={shiftOutlook.tone.toUpperCase()}
                  tone={shiftOutlook.tone}
                />
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#10213a] to-[#0b1730] p-6 text-white shadow-sm ring-1 ring-white/10">
              <div className="text-sm uppercase tracking-wide text-slate-400">
                Protection
              </div>
              <h3 className="mt-3 text-2xl font-semibold">
                {simpleMode ? "Coverage is active" : "Coverage stays active"}
              </h3>
              <p className="mt-3 text-slate-300">
                {simpleMode
                  ? "Your plan updates with current work conditions."
                  : "Your plan stays in sync with live work conditions and payout status."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;