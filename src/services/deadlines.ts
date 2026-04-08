import type { DeadlineItem } from '@/stores/deadlineStore';
import { getAuth } from '@react-native-firebase/auth';

import { generateDeadlinesForYear } from '@/domain/deadlines/engine';
import {
  listUserDeadlines,
  setDeadlineCompletion,
  upsertUserDeadlines,
} from '@/services/deadlineRepository';
import { getUser } from '@/services/user';

function getCurrentUid(): string | null {
  return getAuth().currentUser?.uid ?? null;
}

function toDaysLeft(dueDate: string): number {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00.000Z`);
  return Math.ceil((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function toDeadlineItem(d: DeadlineItem): DeadlineItem {
  return {
    ...d,
    daysLeft: toDaysLeft(d.dueDate),
  };
}

/**
 * Generates default deadlines for a user (e.g. after onboarding).
 * Wire to Supabase `user_deadlines` when ready.
 */
export async function generateUserDeadlines(_userId: string): Promise<DeadlineItem[]> {
  const uid = _userId || getCurrentUid();
  if (!uid) return [];

  const existing = await listUserDeadlines(uid);
  if (existing.length > 0) {
    return existing.map((d) =>
      toDeadlineItem({
        id: d.id,
        title: d.title,
        dueDate: d.dueDate,
        daysLeft: d.daysLeft,
        category: d.category,
        isComplete: d.isComplete,
      }),
    );
  }

  const user = await getUser(uid);
  if (!user?.country || !user?.freelanceType) return [];

  const generated = generateDeadlinesForYear(user.country, user.freelanceType, new Date().getFullYear());
  await upsertUserDeadlines(uid, generated);

  return generated.map((d) =>
    toDeadlineItem({
      id: d.id,
      title: d.title,
      dueDate: d.dueDate,
      daysLeft: d.daysLeft,
      category: d.category,
      isComplete: d.isComplete,
    }),
  );
}

export async function markComplete(_deadlineId: string): Promise<void> {
  const uid = getCurrentUid();
  if (!uid) return;
  const deadlines = await listUserDeadlines(uid);
  const existing = deadlines.find((d) => d.id === _deadlineId);
  if (!existing) return;
  await setDeadlineCompletion(uid, _deadlineId, !existing.isComplete);
}
