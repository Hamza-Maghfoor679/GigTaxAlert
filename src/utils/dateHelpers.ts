export function nextQuarterDate(from: Date = new Date()): Date {
  const month = from.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const next = new Date(from);
  next.setMonth(quarterStartMonth + 3, 1);
  return next;
}

export function daysUntil(target: Date, from: Date = new Date()): number {
  const ms = target.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/**
 * Returns a time-aware greeting string.
 * - 00:00–11:59 → "Good morning"
 * - 12:00–16:59 → "Good afternoon"
 * - 17:00–23:59 → "Good evening"
 */
export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Returns today's date formatted as "Weekday, Month Day".
 * e.g. "Friday, March 20"
 */
export const getFormattedDate = (
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' },
): string => new Date().toLocaleDateString(locale, options);

/**
 * Returns the number of days between now and a future date.
 * Returns 0 if the date is in the past.
 */
export const getDaysLeft = (dueDate: string | Date): number => {
  const due  = new Date(dueDate);
  const now  = new Date();
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};