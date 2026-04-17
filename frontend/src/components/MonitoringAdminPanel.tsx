import { useEffect, useMemo, useState } from "react";
import {
  getMonitoringStatus,
  runMonitoringNow,
  scoreFraud,
  type FraudScoreRequest,
  type FraudScoreResponse,
  type MonitoringStatus,
} from "../services/monitoring";
import { useClaimHistory } from "../hooks/useClaimHistory";
import { useClaimData } from "../hooks/useClaimData";

const defaultFraudInput: FraudScoreRequest = {
  claim_count_7d: 6,
  gps_jump_score: 0.93,
  device_change_count_30d: 3,
  signal_match_score: 0.18,
  trust_score: 0.22,
  platform_inactivity_minutes: 5,
  zone_risk_score: 0.84,
};

const saferFraudInput: FraudScoreRequest = {
  claim_count_7d: 1,
  gps_jump_score: 0.08,
  device_change_count_30d: 0,
  signal_match_score: 0.91,
  trust_score: 0.88,
  platform_inactivity_minutes: 70,
  zone_risk_score: 0.25,
};

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

function toneClassForDecision(decision?: string) {
  if (decision === "manual_review") {
    return "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20";
  }
  return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20";
}

function toneClassForSeverity(severity?: string) {
  if (severity?.toLowerCase() === "high") {
    return "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20";
  }
  if (severity?.toLowerCase() === "medium") {
    return "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20";
  }
  return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20";
}

function pct(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function MonitoringAdminPanel() {
  const [status, setStatus] = useState<MonitoringStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningScan, setRunningScan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fraudInput, setFraudInput] = useState<FraudScoreRequest>(defaultFraudInput);
  const [fraudResult, setFraudResult] = useState<FraudScoreResponse | null>(null);
  const [fraudLoading, setFraudLoading] = useState(false);
  const [fraudError, setFraudError] = useState<string | null>(null);

  const { items: claimHistory } = useClaimHistory([]);
  const { data: currentClaimData } = useClaimData([]);

  async function loadStatus() {
    try {
      setError(null);
      const data = await getMonitoringStatus();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load monitoring status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handleRunScan() {
    try {
      setRunningScan(true);
      setError(null);
      await runMonitoringNow();
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run monitoring scan");
    } finally {
      setRunningScan(false);
    }
  }

  async function handleFraudCheck() {
    try {
      setFraudLoading(true);
      setFraudError(null);
      const result = await scoreFraud(fraudInput);
      setFraudResult(result);
    } catch (err) {
      setFraudError(err instanceof Error ? err.message : "Failed to score fraud");
    } finally {
      setFraudLoading(false);
    }
  }

  function updateField<K extends keyof FraudScoreRequest>(
    key: K,
    value: FraudScoreRequest[K]
  ) {
    setFraudInput((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const latestScanEvents = useMemo(() => {
    if (!status?.last_scan_at || !status?.recent_events?.length) return [];
    return status.recent_events.filter(
      (event) => event.detected_at === status.last_scan_at
    );
  }, [status]);

  const displayedEvents =
    latestScanEvents.length > 0
      ? latestScanEvents
      : status?.recent_events?.slice(0, 6) ?? [];

  const claimsAnalytics = useMemo(() => {
    const totalClaims = claimHistory.length;
    const approvedCount = claimHistory.filter(
      (item) => item.lifecycleStatus === "approved"
    ).length;
    const paidCount = claimHistory.filter(
      (item) => item.lifecycleStatus === "paid"
    ).length;
    const reviewCount = claimHistory.filter(
      (item) => item.lifecycleStatus === "review"
    ).length;
    const checkingCount = claimHistory.filter(
      (item) => item.lifecycleStatus === "checking"
    ).length;

    const totalPayouts = claimHistory.reduce(
      (sum, item) => sum + (item.lifecycleStatus === "paid" ? item.payout || 0 : 0),
      0
    );

    const totalPotentialExposure = claimHistory.reduce(
      (sum, item) => sum + (item.payout || 0),
      0
    );

    const approvalRate = totalClaims
      ? ((approvedCount + paidCount) / totalClaims) * 100
      : 0;

    const payoutRate = totalClaims ? (paidCount / totalClaims) * 100 : 0;

    const estimatedLossRatio = totalPotentialExposure
      ? (totalPayouts / totalPotentialExposure) * 100
      : 0;

    const byScenario = claimHistory.reduce<Record<string, number>>((acc, item) => {
      acc[item.scenario] = (acc[item.scenario] || 0) + 1;
      return acc;
    }, {});

    const scenarioEntries = Object.entries(byScenario).sort((a, b) => b[1] - a[1]);
    const mostCommonDisruption = scenarioEntries[0]?.[0] || "none";

    return {
      totalClaims,
      approvedCount,
      paidCount,
      reviewCount,
      checkingCount,
      totalPayouts,
      approvalRate,
      payoutRate,
      estimatedLossRatio,
      mostCommonDisruption,
      byScenario,
    };
  }, [claimHistory]);

  const disruptionOutlook = useMemo(() => {
    const events = status?.scan_history?.flatMap((scan) => scan.events || []) ?? [];
    const typeCounts = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    const topType = sortedTypes[0]?.[0] || "NONE";

    let nextWeekSummary = "Low disruption pressure likely next week.";
    if (topType === "HEAVY_RAIN") {
      nextWeekSummary = "Rain-linked claims are the most likely pressure point next week.";
    } else if (topType === "UNSAFE_AQI") {
      nextWeekSummary = "Air quality-linked claims may rise next week.";
    } else if (topType === "HEAT_STRESS") {
      nextWeekSummary = "Heat stress may increase claim pressure next week.";
    }

    const latestEvents = displayedEvents;
    const highSeverityCount = latestEvents.filter(
      (event) => event.severity?.toLowerCase() === "high"
    ).length;

    if (highSeverityCount >= 2) {
      nextWeekSummary = "High-severity disruptions were recently detected, so claim pressure may remain elevated next week.";
    }

    return {
      topType,
      nextWeekSummary,
      trackedTypes: sortedTypes.slice(0, 3),
    };
  }, [status, displayedEvents]);

  const currentClaimInsight = useMemo(() => {
    const aiInsight = currentClaimData?.claim?.aiInsight as
      | {
          fraudProbability?: number;
          fraudDecision?: string;
          riskModelSource?: string;
          fraudModelSource?: string;
        }
      | undefined;

    return {
      fraudProbability:
        aiInsight?.fraudProbability != null
          ? `${(aiInsight.fraudProbability * 100).toFixed(1)}%`
          : "N/A",
      fraudDecision: aiInsight?.fraudDecision || "N/A",
      riskModelSource: aiInsight?.riskModelSource || "unknown",
      fraudModelSource: aiInsight?.fraudModelSource || "unknown",
    };
  }, [currentClaimData]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-white">Insurer Analytics</h2>
          <p className="mt-2 text-slate-300">
            Claims performance, payout exposure, and next-week disruption outlook.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <MetricCard label="Total claims" value={String(claimsAnalytics.totalClaims)} />
          <MetricCard label="Approved / paid" value={`${claimsAnalytics.approvedCount + claimsAnalytics.paidCount}`} />
          <MetricCard label="Manual review" value={String(claimsAnalytics.reviewCount)} />
          <MetricCard label="Total payouts" value={`₹${claimsAnalytics.totalPayouts}`} />
          <MetricCard label="Approval rate" value={pct(claimsAnalytics.approvalRate)} />
          <MetricCard label="Est. loss ratio" value={pct(claimsAnalytics.estimatedLossRatio)} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <p className="text-xs uppercase tracking-wide text-slate-400">Most common disruption</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {claimsAnalytics.mostCommonDisruption.toUpperCase()}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Based on current claim history for this insured workflow.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <p className="text-xs uppercase tracking-wide text-slate-400">Next week outlook</p>
            <p className="mt-3 text-lg font-semibold text-white">
              {disruptionOutlook.nextWeekSummary}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Uses recent automated monitoring events as a predictive proxy.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Current fraud probability" value={currentClaimInsight.fraudProbability} />
          <MetricCard label="Current fraud decision" value={currentClaimInsight.fraudDecision} />
          <MetricCard label="Risk model source" value={currentClaimInsight.riskModelSource} />
          <MetricCard label="Fraud model source" value={currentClaimInsight.fraudModelSource} />
        </div>
      </section>

      <section className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">Automated Monitoring</h2>
            <p className="mt-2 text-slate-300">
              Live disruption tracking, scheduler status, and recent trigger events.
            </p>
          </div>

          <button
            onClick={handleRunScan}
            disabled={runningScan}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 font-medium text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
          >
            {runningScan ? "Running..." : "Run Scan Now"}
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white/5 px-5 py-4 text-slate-300 ring-1 ring-white/10">
            Loading monitoring status...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
            {error}
          </div>
        ) : status ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard label="Last scan" value={formatDate(status.last_scan_at)} />
              <MetricCard label="Run count" value={String(status.run_count)} />
              <MetricCard label="Zones checked" value={String(status.last_summary?.zones_checked ?? 0)} />
              <MetricCard label="Events detected" value={String(status.last_summary?.events_detected ?? 0)} />
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-white">Recent events</h3>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 ring-1 ring-white/10">
                  {latestScanEvents.length > 0 ? "Latest scan only" : "Recent history"}
                </span>
              </div>

              {displayedEvents.length === 0 ? (
                <div className="rounded-2xl bg-white/5 px-5 py-4 text-slate-300 ring-1 ring-white/10">
                  No recent events detected.
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedEvents.map((event, index) => (
                    <div
                      key={`${event.event_type}-${event.zone}-${event.detected_at}-${index}`}
                      className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-2xl font-semibold text-white">
                            {event.event_type} • {event.zone}
                          </p>
                          <p className="mt-2 text-slate-300">{event.reason}</p>

                          <div className="mt-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${toneClassForSeverity(
                                event.severity
                              )}`}
                            >
                              Severity: {event.severity}
                            </span>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-2xl font-semibold text-white">
                            ₹{event.estimated_payout}
                          </p>
                          <p className="mt-2 text-sm text-slate-400">
                            {formatDate(event.detected_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>

      <section className="rounded-3xl bg-[#0f1e33] p-6 shadow-sm ring-1 ring-white/10 md:p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-white">Fraud Scoring Demo</h2>
          <p className="mt-2 text-slate-300">
            Test the trained fraud model with claim behaviour and trust signals.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-2 block text-slate-300">Claim count (7d)</span>
            <input
              type="number"
              value={fraudInput.claim_count_7d}
              onChange={(e) => updateField("claim_count_7d", Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white/20"
            />
          </label>

          <label className="text-sm">
            <span className="mb-2 block text-slate-300">GPS jump score</span>
            <input
              type="number"
              step="0.01"
              value={fraudInput.gps_jump_score}
              onChange={(e) => updateField("gps_jump_score", Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white/20"
            />
          </label>

          <label className="text-sm">
            <span className="mb-2 block text-slate-300">Device changes (30d)</span>
            <input
              type="number"
              value={fraudInput.device_change_count_30d}
              onChange={(e) =>
                updateField("device_change_count_30d", Number(e.target.value))
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white/20"
            />
          </label>

          <label className="text-sm">
            <span className="mb-2 block text-slate-300">Signal match score</span>
            <input
              type="number"
              step="0.01"
              value={fraudInput.signal_match_score}
              onChange={(e) => updateField("signal_match_score", Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white/20"
            />
          </label>

          <label className="text-sm">
            <span className="mb-2 block text-slate-300">Trust score</span>
            <input
              type="number"
              step="0.01"
              value={fraudInput.trust_score}
              onChange={(e) => updateField("trust_score", Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white/20"
            />
          </label>

          <label className="text-sm">
            <span className="mb-2 block text-slate-300">Platform inactivity minutes</span>
            <input
              type="number"
              value={fraudInput.platform_inactivity_minutes}
              onChange={(e) =>
                updateField("platform_inactivity_minutes", Number(e.target.value))
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white/20"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="mb-2 block text-slate-300">Zone risk score</span>
            <input
              type="number"
              step="0.01"
              value={fraudInput.zone_risk_score}
              onChange={(e) => updateField("zone_risk_score", Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white/20"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleFraudCheck}
            disabled={fraudLoading}
            className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
          >
            {fraudLoading ? "Scoring..." : "Score Claim"}
          </button>

          <button
            onClick={() => {
              setFraudInput(defaultFraudInput);
              setFraudResult(null);
              setFraudError(null);
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/10"
          >
            Reset Demo
          </button>

          <button
            onClick={() => {
              setFraudInput(saferFraudInput);
              setFraudResult(null);
              setFraudError(null);
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/10"
          >
            Load Safe Example
          </button>
        </div>

        {fraudError ? (
          <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-rose-300">
            {fraudError}
          </div>
        ) : null}

        {fraudResult ? (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <MetricCard label="Model source" value={fraudResult.model_source} />
            <MetricCard
              label="Fraud probability"
              value={`${(fraudResult.fraud_probability * 100).toFixed(1)}%`}
            />
            <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wide text-slate-400">Decision</p>
              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${toneClassForDecision(
                    fraudResult.decision
                  )}`}
                >
                  {fraudResult.decision}
                </span>
              </div>
            </div>
            <MetricCard
              label="Trained at"
              value={
                fraudResult.trained_at
                  ? formatDate(fraudResult.trained_at)
                  : "Fallback used"
              }
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
