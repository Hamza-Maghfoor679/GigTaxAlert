import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { HookDeadline } from '@/hooks/types/deadline.types';
import type { DeadlineCategory } from '@/components/ui/homeComponents/deadline.types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type TimestampLike =
  | FirebaseFirestoreTypes.Timestamp
  | {
      toDate?: () => Date;
      seconds?: number;
    };

export type DeadlineDocData = {
  id?: string;
  title?: string;
  dueDate?: unknown;
  isComplete?: boolean;
  category?: string;
  type?: string;
  description?: string;
  penaltyInfo?: string;
  paymentUrl?: string;
};

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calculateDaysLeft(dueDate: Date, today: Date = new Date()): number {
  const dueStart = startOfLocalDay(dueDate);
  const todayStart = startOfLocalDay(today);
  return Math.floor((dueStart.getTime() - todayStart.getTime()) / ONE_DAY_MS);
}

export function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (value && typeof value === 'object') {
    const ts = value as TimestampLike;
    if (typeof ts.toDate === 'function') {
      const timestampDate = ts.toDate();
      const parsed = new Date(timestampDate);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (typeof ts.seconds === 'number') {
      const parsed = new Date(ts.seconds * 1000);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  return null;
}

export function normalizeDeadline(doc: DeadlineDocData, id: string): HookDeadline | null {
  const dueDate = toDate(doc.dueDate);
  if (!dueDate) return null;

  const normalizedCategory = ((doc.category ?? 'other').trim() || 'other') as DeadlineCategory;

  return {
    id,
    title: (doc.title ?? '').trim() || 'Tax deadline',
    dueDate,
    isComplete: Boolean(doc.isComplete),
    daysLeft: calculateDaysLeft(dueDate),
    category: normalizedCategory,
    type: (doc.type ?? doc.category ?? 'other').trim() || 'other',
    description: (doc.description ?? '').trim() || 'Tax filing or payment deadline.',
    penaltyInfo: doc.penaltyInfo,
    paymentUrl: doc.paymentUrl,
    completed: Boolean(doc.isComplete),
  };
}

type CachedDeadline = Omit<HookDeadline, 'dueDate'> & { dueDate: string };

export function serializeDeadlines(deadlines: HookDeadline[]): CachedDeadline[] {
  return deadlines.map((d) => ({
    ...d,
    dueDate: d.dueDate.toISOString(),
  }));
}

export function deserializeDeadlines(cached: CachedDeadline[]): HookDeadline[] {
  return cached
    .map((item) =>
      normalizeDeadline(
        {
          id: item.id,
          title: item.title,
          dueDate: item.dueDate,
          isComplete: item.isComplete,
          category: item.category,
          type: item.type,
          description: item.description,
          penaltyInfo: item.penaltyInfo,
          paymentUrl: item.paymentUrl,
        },
        item.id,
      ),
    )
    .filter((item): item is HookDeadline => item !== null);
}
