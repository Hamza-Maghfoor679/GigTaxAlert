import type { DeadlineItem } from '@/stores/deadlineStore';
import { getAuth } from '@react-native-firebase/auth';

import { generateDeadlinesForYear } from '@/domain/deadlines/engine';
import type { FreelanceType } from '@/types/schemas/user';
import {
  batchSetDeadlineCompletion,
  listUserDeadlines,
  setDeadlineCompletion,
  type UserDeadlineDoc,
  upsertUserDeadlines,
} from '@/services/deadlineRepository';
import { getUser } from '@/services/user';
import { canonicalizeCountryCode } from '@/utils/countryCodes';
import { doc, getFirestore, setDoc, serverTimestamp } from '@react-native-firebase/firestore';

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
  const country = canonicalizeCountryCode(user?.country);
  if (!country || !user?.freelanceType) return [];

  const generated = generateDeadlinesForYear(country, user.freelanceType, new Date().getFullYear());
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

const generationLocks = new Set<string>();

function lockKey(uid: string, year: number): string {
  return `${uid}:${year}`;
}

function getDeadlineYear(deadline: UserDeadlineDoc): number | null {
  if (typeof deadline.year === 'number' && Number.isFinite(deadline.year)) {
    return deadline.year;
  }

  if (typeof deadline.dueDate === 'string') {
    const parsed = Number(deadline.dueDate.slice(0, 4));
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export async function generateDeadlinesForUser(
  uid: string,
  country: string,
  freelanceType: FreelanceType,
  year: number,
): Promise<UserDeadlineDoc[]> {
  const generated = generateDeadlinesForYear(country, freelanceType, year);
  await upsertUserDeadlines(uid, generated);
  return generated;
}

export async function ensureDeadlinesGeneratedForYear(uid: string, year: number): Promise<void> {
  const key = lockKey(uid, year);
  if (generationLocks.has(key)) return;

  generationLocks.add(key);
  try {
    const user = await getUser(uid);
    const country = canonicalizeCountryCode(user?.country);
    if (!country || !user?.freelanceType) return;

    const existingDeadlines = await listUserDeadlines(uid);
    const hasCurrentYearDeadlines = existingDeadlines.some((deadline) => getDeadlineYear(deadline) === year);
    const alreadyGenerated = user.deadlinesGeneratedYear === year;

    // Regenerate if user flag is stale OR current-year docs are missing (migration safety).
    if (!alreadyGenerated || !hasCurrentYearDeadlines) {
      await generateDeadlinesForUser(uid, country, user.freelanceType, year);
      await setDoc(
        doc(getFirestore(), 'users', uid),
        {
          deadlinesGeneratedYear: year,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  } finally {
    generationLocks.delete(key);
  }
}

export async function getUserDeadlines(uid: string): Promise<UserDeadlineDoc[]> {
  let stored = await listUserDeadlines(uid);
  if (stored.length > 0) return stored;

  await generateUserDeadlines(uid);
  stored = await listUserDeadlines(uid);
  return stored;
}

export async function setDeadlineComplete(
  deadlineId: string,
  isComplete: boolean,
): Promise<void> {
  const uid = getCurrentUid();
  if (!uid) return;
  await setDeadlineCompletion(uid, deadlineId, isComplete);
}

export async function markComplete(_deadlineId: string): Promise<void> {
  const uid = getCurrentUid();
  if (!uid) return;
  const deadlines = await listUserDeadlines(uid);
  const existing = deadlines.find((d) => d.id === _deadlineId);
  if (!existing) return;
  await setDeadlineCompletion(uid, _deadlineId, !existing.isComplete);
}

export async function markCompleteBatch(
  updates: Array<{ deadlineId: string; isComplete: boolean }>,
): Promise<void> {
  const uid = getCurrentUid();
  if (!uid) return;
  await batchSetDeadlineCompletion(uid, updates);
}
