import type { Deadline, DeadlineType, UrgencyLevel } from '@/components/ui/homeComponents/deadline.types';

type Rule = {
  id: string;
  title: string;
  description: string;
  type: DeadlineType;
  month: number;
  day: number;
  yearOffset?: number;
};

function toUrgency(daysLeft: number): UrgencyLevel {
  if (daysLeft > 30) return 'safe';
  if (daysLeft >= 8) return 'warning';
  return 'critical';
}

function differenceInDays(left: Date, right: Date): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const utcLeft = Date.UTC(left.getFullYear(), left.getMonth(), left.getDate());
  const utcRight = Date.UTC(right.getFullYear(), right.getMonth(), right.getDate());
  return Math.floor((utcLeft - utcRight) / dayMs);
}

function buildDeadline(country: string, currentYear: number, rule: Rule, today: Date): Deadline {
  const dueDate = new Date(currentYear + (rule.yearOffset ?? 0), rule.month, rule.day);
  const daysLeft = differenceInDays(dueDate, today);
  const yearSuffix = dueDate.getFullYear();

  return {
    id: `${rule.id}-${yearSuffix}`,
    title: rule.title,
    description: rule.description,
    dueDate,
    country,
    type: rule.type,
    daysLeft,
    urgency: toUrgency(daysLeft),
    isComplete: false,
  };
}

export function generateDeadlines(country: string, currentYear: number): Deadline[] {
  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const rulesByCountry: Record<string, Rule[]> = {
    US: [
      {
        id: 'us-q1',
        title: 'Q1 Estimated Tax',
        description:
          'Pay your first quarter federal estimated taxes to the IRS to avoid underpayment penalties.',
        type: 'quarterly',
        month: 3,
        day: 15,
      },
      {
        id: 'us-q2',
        title: 'Q2 Estimated Tax',
        description:
          'Second quarter estimated tax payment due. Covers income earned April–May.',
        type: 'quarterly',
        month: 5,
        day: 16,
      },
      {
        id: 'us-q3',
        title: 'Q3 Estimated Tax',
        description:
          'Third quarter estimated tax payment. Covers income earned June–August.',
        type: 'quarterly',
        month: 8,
        day: 15,
      },
      {
        id: 'us-q4',
        title: 'Q4 Estimated Tax',
        description: 'Final quarter payment. Covers September–December income.',
        type: 'quarterly',
        month: 0,
        day: 15,
        yearOffset: 1,
      },
      {
        id: 'us-annual',
        title: 'Annual Tax Return (1040)',
        description:
          'File your federal income tax return or extension. Include Schedule SE for self-employment income.',
        type: 'annual',
        month: 3,
        day: 15,
      },
    ],
    GB: [
      {
        id: 'uk-poa1',
        title: 'Payment on Account 1',
        description:
          "First instalment of your self-assessment tax bill. Based on last year's liability.",
        type: 'self-assessment',
        month: 0,
        day: 31,
      },
      {
        id: 'uk-poa2',
        title: 'Payment on Account 2',
        description: 'Second instalment of your self-assessment bill.',
        type: 'self-assessment',
        month: 6,
        day: 31,
      },
      {
        id: 'uk-filing',
        title: 'Self-Assessment Filing',
        description:
          'Online tax return deadline. Late filing triggers an automatic £100 penalty.',
        type: 'self-assessment',
        month: 0,
        day: 31,
      },
      {
        id: 'uk-taxyearend',
        title: 'Tax Year End',
        description:
          'UK tax year closes. Ensure all income and expenses are recorded for 2025/26.',
        type: 'annual',
        month: 3,
        day: 5,
      },
    ],
    DE: [
      {
        id: 'eu-vat-q1',
        title: 'Q1 VAT Return',
        description:
          'Submit and pay VAT collected from clients in Q1. Late payment accrues interest.',
        type: 'vat',
        month: 3,
        day: 30,
      },
      {
        id: 'eu-vat-q2',
        title: 'Q2 VAT Return',
        description: 'Submit and pay Q2 VAT. Keep all client invoices ready.',
        type: 'vat',
        month: 6,
        day: 31,
      },
      {
        id: 'eu-vat-q3',
        title: 'Q3 VAT Return',
        description:
          'Q3 VAT return due. Reconcile any VAT reclaimed on business expenses.',
        type: 'vat',
        month: 9,
        day: 31,
      },
      {
        id: 'eu-vat-q4',
        title: 'Q4 VAT Return',
        description: 'Final VAT return of the year.',
        type: 'vat',
        month: 0,
        day: 31,
        yearOffset: 1,
      },
    ],
    FR: [
      {
        id: 'eu-vat-q1',
        title: 'Q1 VAT Return',
        description:
          'Submit and pay VAT collected from clients in Q1. Late payment accrues interest.',
        type: 'vat',
        month: 3,
        day: 30,
      },
      {
        id: 'eu-vat-q2',
        title: 'Q2 VAT Return',
        description: 'Submit and pay Q2 VAT. Keep all client invoices ready.',
        type: 'vat',
        month: 6,
        day: 31,
      },
      {
        id: 'eu-vat-q3',
        title: 'Q3 VAT Return',
        description:
          'Q3 VAT return due. Reconcile any VAT reclaimed on business expenses.',
        type: 'vat',
        month: 9,
        day: 31,
      },
      {
        id: 'eu-vat-q4',
        title: 'Q4 VAT Return',
        description: 'Final VAT return of the year.',
        type: 'vat',
        month: 0,
        day: 31,
        yearOffset: 1,
      },
    ],
    NL: [
      {
        id: 'eu-vat-q1',
        title: 'Q1 VAT Return',
        description:
          'Submit and pay VAT collected from clients in Q1. Late payment accrues interest.',
        type: 'vat',
        month: 3,
        day: 30,
      },
      {
        id: 'eu-vat-q2',
        title: 'Q2 VAT Return',
        description: 'Submit and pay Q2 VAT. Keep all client invoices ready.',
        type: 'vat',
        month: 6,
        day: 31,
      },
      {
        id: 'eu-vat-q3',
        title: 'Q3 VAT Return',
        description:
          'Q3 VAT return due. Reconcile any VAT reclaimed on business expenses.',
        type: 'vat',
        month: 9,
        day: 31,
      },
      {
        id: 'eu-vat-q4',
        title: 'Q4 VAT Return',
        description: 'Final VAT return of the year.',
        type: 'vat',
        month: 0,
        day: 31,
        yearOffset: 1,
      },
    ],
  };

  const normalizedCountry = country.toUpperCase() === 'UK' ? 'GB' : country.toUpperCase();
  const rules = rulesByCountry[normalizedCountry] ?? [];

  return rules
    .map((rule) => buildDeadline(normalizedCountry, currentYear, rule, normalizedToday))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}
