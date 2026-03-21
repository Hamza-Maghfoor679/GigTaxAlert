// ─── Deadline domain ─────────────────────────────────────────────────────────

export type DeadlineCategory =
  | 'income_tax'
  | 'self_employment'
  | 'quarterly'
  | 'state'
  | 'vat'
  | 'other';

export type Deadline = {
  id: string;
  title: string;
  dueDate: string;       // ISO string  e.g. "2025-04-15"
  daysLeft: number;
  category: DeadlineCategory;
  description: string;   // plain-English explainer
  penaltyInfo: string;   // what happens if missed
  paymentUrl: string;    // how to pay
  isCompleted: boolean;
  completedAt?: string;  // ISO string
};

// ─── Tax estimate domain ──────────────────────────────────────────────────────

export type TaxEstimate = {
  amountDue: number;
  currency: string;       // e.g. "USD"
  dueDate: string;        // ISO string
  deadlineTitle: string;  // e.g. "Q1 Estimated Tax"
  isPro: boolean;
};
