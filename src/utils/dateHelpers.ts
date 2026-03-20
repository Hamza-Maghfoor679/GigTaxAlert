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
