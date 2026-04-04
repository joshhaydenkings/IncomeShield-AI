import { ShieldCheck, CalendarDays, BadgeIndianRupee, UserRound, FileText } from "lucide-react";
import { usePolicy } from "../hooks/usePolicy";
import { useClaimData } from "../hooks/useClaimData";
import type { WorkerProfile } from "../types";

type PolicyProps = {
  worker: WorkerProfile;
};

function Policy({ worker }: PolicyProps) {
  const { policy, loading, error } = usePolicy([
    worker.city,
    worker.zone,
    worker.shift,
    worker.workerType,
    worker.plan,
  ]);

  const {
    data: claimData,
    loading: claimLoading,
  } = useClaimData([worker.city, worker.zone, worker.shift, worker.workerType, worker.plan]);

  if (loading || !policy) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="rounded-3xl bg-[#0f1e33] px-8 py-6 text-slate-200 shadow-sm ring-1 ring-white/10">
          Loading policy...
        </div>
      </div>
    );
  }

  const currentClaim = claimData?.claim;
  const protectionDecision = getProtectionDecisionLabel(currentClaim?.payoutStatus);
  const protectionReason = currentClaim?.workerMessage || "No current protection update.";
  const decisionTone = getDecisionTone(currentClaim?.payoutStatus);

  return (
    <div className="min-h-screen bg-[#07111f] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-cyan-300" />
            <div>
              <h1 className="text-3xl font-bold text-white">Policy document</h1>
              <p className="mt-1 text-slate-400">
                Your current weekly protection details and active coverage status.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card label="Policy number" value={policy.policyNumber} />
            <Card label="Policy status" value={capitalize(policy.status)} />
            <Card label="Plan" value={policy.planName} />
            <Card label="Weekly premium" value={`₹${policy.weeklyPremium}`} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Card
              label="Effective date"
              value={formatDate(policy.effectiveDate)}
              icon={<CalendarDays className="h-5 w-5" />}
            />
            <Card
              label="Renewal date"
              value={formatDate(policy.renewalDate)}
              icon={<CalendarDays className="h-5 w-5" />}
            />
            <Card
              label="Maximum coverage"
              value={`₹${policy.protection}`}
              icon={<BadgeIndianRupee className="h-5 w-5" />}
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <div className="mb-4 flex items-center gap-2">
                <UserRound className="h-5 w-5 text-slate-300" />
                <h2 className="text-xl font-semibold text-white">Insured worker details</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Name" value={worker.name} />
                <InfoRow label="City" value={worker.city} />
                <InfoRow label="Zone" value={worker.zone} />
                <InfoRow label="Shift" value={worker.shift} />
                <InfoRow label="Work type" value={worker.workerType} />
                <InfoRow label="Language" value={worker.language.toUpperCase()} />
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-300" />
                <h2 className="text-xl font-semibold text-white">Current protection decision</h2>
              </div>

              {claimLoading ? (
                <div className="text-slate-400">Loading decision...</div>
              ) : (
                <>
                  <div
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      decisionTone === "good"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : decisionTone === "warn"
                          ? "bg-amber-500/15 text-amber-300"
                          : decisionTone === "danger"
                            ? "bg-rose-500/15 text-rose-300"
                            : "bg-white/10 text-slate-200"
                    }`}
                  >
                    {protectionDecision}
                  </div>

                  <div className="mt-4 text-slate-300">{protectionReason}</div>

                  {currentClaim?.issue ? (
                    <div className="mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="text-sm text-slate-400">Current event</div>
                      <div className="mt-2 text-white">{currentClaim.issue}</div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <h2 className="text-xl font-semibold text-white">Coverage terms</h2>

            <div className="mt-4 space-y-3">
              <Term>
                This policy provides weekly protection based on your selected plan and current work profile.
              </Term>
              <Term>
                Coverage activates for supported disruption events that affect your ability to work and earn income.
              </Term>
              <Term>
                Protection decisions may be approved instantly, checked automatically, or routed to manual review depending on current conditions and claim signals.
              </Term>
              <Term>
                Duplicate claims for the same recent disruption may be blocked to prevent repeated payouts.
              </Term>
              <Term>
                Weekly premium and coverage details are refreshed when your saved profile, plan, or risk conditions change.
              </Term>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <h2 className="text-xl font-semibold text-white">Why this policy is active</h2>

            <div className="mt-4 space-y-3">
              <ReasonLine text={`Your current selected plan is ${policy.planName}.`} />
              <ReasonLine text={`Your weekly premium is ₹${policy.weeklyPremium} and your maximum protection is ₹${policy.protection}.`} />
              <ReasonLine text={`This policy is active for the saved work profile in ${worker.city}, ${worker.zone}.`} />
              <ReasonLine text={`Your current renewal date is ${formatDate(policy.renewalDate)}.`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-slate-300">{icon}</div>
      </div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-white">{value || "-"}</div>
    </div>
  );
}

function Term({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-3 text-slate-300">
      {children}
    </div>
  );
}

function ReasonLine({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-3 text-slate-300">
      {text}
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function capitalize(value?: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getProtectionDecisionLabel(status?: string) {
  switch (status) {
    case "approved":
      return "Approved";
    case "checking":
      return "Checking";
    case "review":
      return "Manual review";
    case "paid":
      return "Paid";
    case "none":
    default:
      return "No active payout";
  }
}

function getDecisionTone(status?: string): "good" | "warn" | "danger" | "default" {
  switch (status) {
    case "approved":
    case "paid":
      return "good";
    case "checking":
      return "warn";
    case "review":
      return "danger";
    default:
      return "default";
  }
}

export default Policy;