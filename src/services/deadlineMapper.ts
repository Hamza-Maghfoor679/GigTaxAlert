import type { Deadline, DeadlineCategory } from '@/components/ui/homeComponents/deadline.types';
import type { UserDeadlineDoc } from '@/services/deadlineRepository';

const DAY_MS = 24 * 60 * 60 * 1000;

type TimestampLike = {
  toDate?: () => Date;
  seconds?: number;
};

function datePartsToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDueDateToIso(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoLikeMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoLikeMatch) {
      const [, year, month, day] = isoLikeMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return datePartsToIso(parsed);
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return datePartsToIso(value);
  }

  if (value && typeof value === 'object') {
    const timestamp = value as TimestampLike;
    if (typeof timestamp.toDate === 'function') {
      const parsed = timestamp.toDate();
      if (!Number.isNaN(parsed.getTime())) return datePartsToIso(parsed);
    }

    if (typeof timestamp.seconds === 'number') {
      const parsed = new Date(timestamp.seconds * 1000);
      if (!Number.isNaN(parsed.getTime())) return datePartsToIso(parsed);
    }
  }

  return null;
}

export function daysLeftFromIso(isoDate: string): number {
  const now = new Date();
  const localToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [year, month, day] = isoDate.split('-').map(Number);
  const dueLocal = new Date(year, month - 1, day);
  return Math.ceil((dueLocal.getTime() - localToday.getTime()) / DAY_MS);
}

export function getMonthKeyFromDueDate(value: unknown): string | null {
  const iso = normalizeDueDateToIso(value);
  return iso ? iso.slice(0, 7) : null;
}

export function getLocalTodayKey(): string {
  return datePartsToIso(new Date());
}

export function getLocalCurrentMonthKey(): string {
  return getLocalTodayKey().slice(0, 7);
}

export function toUiDeadline(item: UserDeadlineDoc): Deadline | null {
  const category = (item.category as DeadlineCategory) ?? 'other';
  const isoDueDate = normalizeDueDateToIso(item.dueDate);
  if (!isoDueDate) return null;

  const isComplete = Boolean(item.isComplete);
  return {
    id: item.id,
    title: item.title,
    dueDate: isoDueDate,
    daysLeft: daysLeftFromIso(isoDueDate),
    type: category,
    category,
    description: item.description,
    penaltyInfo: item.penaltyInfo,
    paymentUrl: item.paymentUrl,
    isComplete,
    completed: isComplete,
  };
}
