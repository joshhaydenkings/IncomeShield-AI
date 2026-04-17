const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export type MonitoringEvent = {
  event_type: string;
  zone: string;
  severity: string;
  reason: string;
  estimated_payout: number;
  detected_at: string;
};

export type MonitoringStatus = {
  last_scan_at: string | null;
  run_count: number;
  last_summary: {
    scan_timestamp?: string;
    zones_checked?: number;
    events_detected?: number;
    event_types?: string[];
  };
  recent_events: MonitoringEvent[];
};

export type FraudScoreRequest = {
  claim_count_7d: number;
  gps_jump_score: number;
  device_change_count_30d: number;
  signal_match_score: number;
  trust_score: number;
  platform_inactivity_minutes: number;
  zone_risk_score: number;
};

export type FraudScoreResponse = {
  timestamp: string;
  model_source: string;
  trained_at?: string;
  fraud_probability: number;
  decision: string;
  warning?: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getMonitoringStatus(): Promise<MonitoringStatus> {
  const response = await fetch(`${API_BASE}/monitoring/status`);
  return handleResponse<MonitoringStatus>(response);
}

export async function runMonitoringNow(): Promise<unknown> {
  const response = await fetch(`${API_BASE}/monitoring/run-now`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse(response);
}

export async function scoreFraud(
  payload: FraudScoreRequest
): Promise<FraudScoreResponse> {
  const response = await fetch(`${API_BASE}/monitoring/fraud-score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<FraudScoreResponse>(response);
}