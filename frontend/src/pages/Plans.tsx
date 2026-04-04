import { useEffect, useMemo, useState } from "react";
import { usePlans } from "../hooks/usePlans";
import { tr } from "../services/translations";
import { useVoice } from "../hooks/useVoice";
import { buildPlansVoice } from "../utils/pageVoice";
import VoiceButton from "../components/common/VoiceButton";
import PageHeader from "../components/common/PageHeader";
import type { Plan, WorkerProfile } from "../types";

type PlansProps = {
  worker: WorkerProfile;
  onBackToDashboard: () => void;
  onUpdatePlan: (plan: Plan) => void;
  simpleMode: boolean;
};

function Plans({ worker, onBackToDashboard, onUpdatePlan, simpleMode }: PlansProps) {
  const { speak } = useVoice(worker.language);
  const { plans, loading, error, currentScenario } = usePlans([
    worker.city,
    worker.zone,
    worker.shift,
    worker.workerType,
    worker.plan,
  ]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!showSaved) return;
    const timer = setTimeout(() => setShowSaved(false), 2200);
    return () => clearTimeout(timer);
  }, [showSaved]);

  const currentPlan = useMemo(() => {
    return plans.find((plan) => plan.name === worker.plan) ?? null;
  }, [plans, worker.plan]);

  if (loading || !currentPlan) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="rounded-3xl bg-[#0f1e33] px-8 py-6 text-slate-200 shadow-sm ring-1 ring-white/10">
          Loading plans...
        </div>
      </div>
    );
  }

  const voiceText = buildPlansVoice({
    simpleMode,
    worker,
    currentPlan,
    plans,
  });

  return (
    <div className="min-h-screen bg-[#07111f] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title={simpleMode ? "Plans" : tr(worker.language, "weeklyProtectionPlans")}
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

        {showSaved && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-emerald-300 shadow-sm">
            Plan updated successfully.
          </div>
        )}

        <div className="mb-8 rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
          <div className="text-sm text-slate-400">
            {simpleMode ? "Current plan" : tr(worker.language, "currentPlan")}
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{currentPlan.name}</div>
          <div className="mt-2 text-slate-300">{currentPlan.badge}</div>

          <div className="mt-3 text-sm text-cyan-300">
            Pricing reflects your current profile and scenario: {currentScenario}
          </div>

          <div className="mt-3 text-sm text-emerald-300">
            Pricing mode: {currentPlan.pricingMode === "rules" ? "Rule fallback" : "ML hybrid model"}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-sm text-slate-400">{tr(worker.language, "youPay")}</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                ₹{currentPlan.premium}/{tr(worker.language, "perWeek")}
              </div>
              <div className="mt-1 text-sm text-slate-400">
                Base price: ₹{currentPlan.basePremium}
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-sm text-slate-400">{tr(worker.language, "protectedUpTo")}</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                ₹{currentPlan.protection}
              </div>
            </div>

            <div className="rounded-2xl bg-[#0d1b2e] p-4 text-white ring-1 ring-white/10">
              <div className="text-sm text-slate-400">Current risk-based pricing</div>
              <div className="mt-2 text-lg font-semibold">
                {currentPlan.premium > currentPlan.basePremium
                  ? "Adjusted upward"
                  : currentPlan.premium < currentPlan.basePremium
                    ? "Adjusted downward"
                    : "Base price active"}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-sm font-medium text-slate-300">Why this weekly price changed</div>
            <div className="mt-3 space-y-2">
              {currentPlan.pricingReasons.map((reason, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300"
                >
                  {reason}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isActive = worker.plan === plan.name;

            return (
              <div
                key={plan.name}
                className={`rounded-3xl p-6 shadow-sm ring-1 transition ${
                  isActive
                    ? "bg-[#10213a] text-white ring-white/15"
                    : "bg-[#0f1e33] text-white ring-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  {isActive && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#07111f]">
                      Active
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-400">{plan.badge}</p>

                <div className="mt-3 text-xs text-emerald-300">
                  {plan.pricingMode === "rules" ? "Rule pricing" : "ML hybrid pricing"}
                </div>

                <div className="mt-6">
                  <div className="text-4xl font-bold">₹{plan.premium}</div>
                  <div className="text-sm text-slate-400">
                    {tr(worker.language, "perWeek")}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Base: ₹{plan.basePremium}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-sm text-slate-400">
                    {simpleMode ? "Coverage" : tr(worker.language, "maximumProtection")}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">₹{plan.protection}</div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-sm font-medium text-slate-300">Price factors</div>
                  <div className="mt-3 space-y-2">
                    {plan.pricingReasons.map((reason, index) => (
                      <div key={index} className="text-sm text-slate-400">
                        • {reason}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => {
                      onUpdatePlan(plan.name);
                      if (!isActive) setShowSaved(true);
                    }}
                    className={`w-full rounded-2xl px-4 py-3 font-semibold transition ${
                      isActive
                        ? "bg-white text-[#07111f] hover:bg-slate-200"
                        : "bg-[#1a3154] text-white hover:bg-[#223d68]"
                    }`}
                  >
                    {isActive
                      ? tr(worker.language, "currentPlanButton")
                      : tr(worker.language, "switchToThisPlan")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Plans;