export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

const STORAGE_KEY = "income_shield_activity_log";

export function getActivityLog(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addActivityLog(item: Omit<ActivityItem, "id">) {
  const nextItem: ActivityItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...item,
  };

  const current = getActivityLog();
  const next = [nextItem, ...current].slice(0, 8);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearActivityLog() {
  localStorage.removeItem(STORAGE_KEY);
}
