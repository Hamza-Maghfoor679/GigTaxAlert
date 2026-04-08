import type { Colors } from '@/theme';
import type { DeadlineType } from './deadline.types';

export type DeadlineCategory = 'income_tax' | 'self_employment' | 'quarterly' | 'state' | 'vat' | 'other';
type CategoryKey = DeadlineCategory | DeadlineType;

type CategoryMeta = {
  label: string;
  color: (c: Colors) => string;
  bg: (c: Colors) => string;
};

export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  income_tax: {
    label: 'Income Tax',
    color: (c) => c.primary,
    bg:    (c) => c.primaryLight,
  },
  self_employment: {
    label: 'Self-Employment',
    color: (c) => c.secondary,
    bg:    (c) => c.secondary + '20',
  },
  quarterly: {
    label: 'Quarterly',
    color: (c) => c.warning,
    bg:    (c) => c.warning + '20',
  },
  annual: {
    label: 'Annual',
    color: (c) => c.primary,
    bg:    (c) => c.primaryLight,
  },
  'self-assessment': {
    label: 'Self Assessment',
    color: (c) => c.secondary,
    bg:    (c) => c.secondary + '20',
  },
  state: {
    label: 'State Tax',
    color: (c) => '#8B5CF6',
    bg:    ()  => '#EDE9FE',
  },
  vat: {
    label: 'VAT',
    color: (c) => c.secondary,
    bg:    (c) => c.secondary + '20',
  },
  other: {
    label: 'Other',
    color: (c) => c.textSecondary,
    bg:    (c) => c.border,
  },
};
