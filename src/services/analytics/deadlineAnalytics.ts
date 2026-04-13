export type DeadlineAnalyticsPayload = {
  deadlineId: string;
  source?: 'home' | 'calendar' | 'unknown';
};

type DeadlineAnalyticsAdapter = {
  trackDeadlineCompleted?: (payload: DeadlineAnalyticsPayload) => void | Promise<void>;
  trackDeadlineOpened?: (payload: DeadlineAnalyticsPayload) => void | Promise<void>;
};

let analyticsAdapter: DeadlineAnalyticsAdapter = {};

export function setDeadlineAnalyticsAdapter(adapter: DeadlineAnalyticsAdapter): void {
  analyticsAdapter = adapter;
}

export async function trackDeadlineCompleted(payload: DeadlineAnalyticsPayload): Promise<void> {
  await analyticsAdapter.trackDeadlineCompleted?.(payload);
}

export async function trackDeadlineOpened(payload: DeadlineAnalyticsPayload): Promise<void> {
  await analyticsAdapter.trackDeadlineOpened?.(payload);
}
