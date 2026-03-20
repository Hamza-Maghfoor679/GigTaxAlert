import type { DeadlineItem } from '@/stores/deadlineStore';

/**
 * Generates default deadlines for a user (e.g. after onboarding).
 * Wire to Supabase `user_deadlines` when ready.
 */
export async function generateUserDeadlines(_userId: string): Promise<DeadlineItem[]> {
  return [];
}

export async function markComplete(_deadlineId: string): Promise<void> {
  // TODO: update Supabase row
}
