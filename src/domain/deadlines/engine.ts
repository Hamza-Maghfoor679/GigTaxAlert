import type { FreelanceType } from '@/types/schemas/user';
import { DE_RULES } from '@/constants/deadlines/DE';
import { FR_RULES } from '@/constants/deadlines/FR';
import { NL_RULES } from '@/constants/deadlines/NL';
import { UK_RULES } from '@/constants/deadlines/UK';
import { US_RULES } from '@/constants/deadlines/US';

type SupportedCountry = 'US' | 'GB' | 'DE' | 'FR' | 'NL';

type RawRule = {
  id?: string;
  name?: string;
  category?: string;
  due?: { month?: number; day?: number };
  description?: string;
  penalty?: string;
  payment_url?: string;
  applies_to?: string[];
};

export type GeneratedDeadline = {
  id: string;
  title: string;
  dueDate: string;
  daysLeft: number;
  category: string;
  description: string;
  penaltyInfo: string;
  paymentUrl: string;
  isComplete: boolean;
};

const RULES_BY_COUNTRY: Partial<Record<SupportedCountry, unknown>> = {
  US: US_RULES,
  GB: UK_RULES,
  DE: DE_RULES,
  FR: FR_RULES,
  NL: NL_RULES,
};

function toIsoDate(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function daysUntil(isoDate: string): number {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const due = new Date(`${isoDate}T00:00:00.000Z`);
  const diff = due.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function mapCategory(category?: string): string {
  switch (category) {
    case 'estimated_tax':
      return 'quarterly';
    case 'self_assessment':
      return 'income_tax';
    case '1099':
      return 'other';
    default:
      return category ?? 'other';
  }
}

function ruleApplies(rule: RawRule, _freelanceType: FreelanceType): boolean {
  const appliesTo = rule.applies_to ?? ['all'];
  return appliesTo.includes('all');
}

function normalizeRules(country: SupportedCountry): RawRule[] {
  const raw = RULES_BY_COUNTRY[country];
  if (!Array.isArray(raw)) return [];
  return raw as RawRule[];
}

export function generateDeadlinesForYear(
  country: string,
  freelanceType: FreelanceType,
  taxYear: number,
): GeneratedDeadline[] {
  const countryRules = normalizeRules(country as SupportedCountry);

  return countryRules
    .filter((rule) => rule?.due?.month && rule?.due?.day && ruleApplies(rule, freelanceType))
    .map((rule, index) => {
      const dueDate = toIsoDate(taxYear, Number(rule.due?.month), Number(rule.due?.day));
      return {
        id: rule.id ?? `${country.toLowerCase()}-${taxYear}-${index}`,
        title: rule.name ?? 'Tax deadline',
        dueDate,
        daysLeft: daysUntil(dueDate),
        category: mapCategory(rule.category),
        description: rule.description ?? 'Tax filing or payment deadline.',
        penaltyInfo: rule.penalty ?? 'Penalties may apply for late payment or filing.',
        paymentUrl: rule.payment_url ?? '',
        isComplete: false,
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
