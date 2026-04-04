import type { WorkerProfile } from "../types";

type ClaimLike = {
  issue: string;
  workerMessage: string;
  score: number;
  payoutStatus: string;
  payout: number;
  fraudFlag: boolean;
  reasons: string[];
};

type PlanInfoLike = {
  name: string;
  premium: number;
  protection: number;
  badge: string;
};

type ActivityItem = {
  title: string;
  detail: string;
};

export function buildDashboardVoice(params: {
  worker: WorkerProfile;
  simpleMode: boolean;
  statusLabel: string;
  payoutText: string;
  nextActionTitle: string;
  nextActionBody: string;
  shiftOutlookTitle: string;
  shiftOutlookDetail: string;
  claim: ClaimLike;
  planInfo: PlanInfoLike;
  activityItems: ActivityItem[];
}) {
  const {
    worker,
    simpleMode,
    statusLabel,
    payoutText,
    nextActionTitle,
    nextActionBody,
    shiftOutlookTitle,
    shiftOutlookDetail,
    claim,
    planInfo,
  } = params;

  return [
    `Welcome, ${worker.name}`,
    simpleMode ? "Can you work now?" : "Can you earn now?",
    `${claim.score}. ${statusLabel}`,
    claim.issue,
    simpleMode ? "Payout status" : "Current payout state",
    payoutText,
    claim.workerMessage,
    simpleMode ? "Next step" : "Next best action",
    nextActionTitle,
    nextActionBody,
    "Weekly plan",
    `${planInfo.name}. ${planInfo.badge}`,
    `You pay ₹${planInfo.premium} per week`,
    `Protected up to ₹${planInfo.protection}`,
    "Your profile",
    `City ${worker.city}`,
    `Zone ${worker.zone}`,
    `Shift ${worker.shift}`,
    `Your work ${worker.workerType}`,
    `Language ${worker.language.toUpperCase()}`,
    simpleMode ? "Next shift" : "Next shift outlook",
    shiftOutlookTitle,
    shiftOutlookDetail,
    "Protection",
    simpleMode
      ? "Coverage is active. Your plan updates with current work conditions."
      : "Coverage stays active. Your plan stays in sync with live work conditions and payout status.",
  ];
}

export function buildPlansVoice(params: {
  simpleMode: boolean;
  worker: WorkerProfile;
  currentPlan: PlanInfoLike;
  plans: PlanInfoLike[];
}) {
  const { simpleMode, worker, currentPlan, plans } = params;

  return [
    simpleMode ? "Plans" : "Weekly protection plans",
    "Current plan",
    `${currentPlan.name}. ${currentPlan.badge}`,
    `You pay ₹${currentPlan.premium} per week`,
    `Protected up to ₹${currentPlan.protection}`,
    `Name ${worker.name}`,
    "Available plans",
    ...plans.map(
      (plan) =>
        `${plan.name}. ₹${plan.premium} per week. ₹${plan.protection} coverage.`
    ),
  ];
}

export function buildAlertsVoice(params: {
  simpleMode: boolean;
  worker: WorkerProfile;
  claim: ClaimLike & { risk: string };
  statusLabel: string;
}) {
  const { simpleMode, worker, claim, statusLabel } = params;

  return [
    simpleMode ? "Alerts" : "Live alerts",
    "Your status",
    worker.name,
    `${worker.city}, ${worker.zone}`,
    worker.shift,
    simpleMode ? "Can you work now?" : "Can you earn now?",
    statusLabel,
    "Current condition",
    claim.issue,
    "Latest update",
    claim.workerMessage,
    "Risk level",
    claim.risk,
  ];
}

export function buildClaimsVoice(params: {
  simpleMode: boolean;
  worker: WorkerProfile;
  claim: ClaimLike & {
    aiInsight?: {
      predictedRisk?: string;
      predictedFraud?: boolean;
      inputSummary?: string;
    };
  };
  planInfo: PlanInfoLike;
  payoutText: string;
}) {
  const { simpleMode, worker, claim, planInfo, payoutText } = params;

  return [
    simpleMode ? "Claims" : "Claim and payout status",
    `Name ${worker.name}`,
    `Weekly plan ${planInfo.name}`,
    `Protected up to ₹${planInfo.protection}`,
    "Payout status",
    payoutText,
    `Estimated payout ₹${claim.payout}`,
    `Fraud check ${claim.fraudFlag ? "Needs review" : "Normal"}`,
    "Current condition",
    claim.issue,
    "Latest update",
    claim.workerMessage,
    simpleMode ? "AI result" : "AI insight",
    simpleMode ? "Predicted risk" : "AI risk prediction",
    claim.aiInsight?.predictedRisk ?? "unknown",
    simpleMode ? "Fraud review flag" : "AI fraud review flag",
    claim.aiInsight?.predictedFraud ? "Yes" : "No",
    simpleMode ? "What was checked" : "What the AI checked",
    claim.aiInsight?.inputSummary ?? "profile and scenario",
    simpleMode ? "Why this happened" : "Why this decision was made",
    ...claim.reasons,
  ];
}

export function buildAdminVoice(params: {
  simpleMode: boolean;
  workerName: string;
  reviewType: string;
  fraudStatus: string;
  payoutRoute: string;
  reasons: string[];
}) {
  const { simpleMode, workerName, reviewType, fraudStatus, payoutRoute, reasons } = params;

  return [
    simpleMode ? "Admin review" : "Fraud and payout control center",
    `Worker ${workerName}`,
    `Scenario ${reviewType}`,
    `Fraud status ${fraudStatus}`,
    `Payout route ${payoutRoute}`,
    simpleMode ? "Why this happened" : "Why this case looks this way",
    ...reasons,
  ];
}