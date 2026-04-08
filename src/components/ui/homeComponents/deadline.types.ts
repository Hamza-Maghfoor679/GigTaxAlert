export type DeadlineCategory =
  | 'income_tax'
  | 'self_employment'
  | 'quarterly'
  | 'state'
  | 'vat'
  | 'other';

export type DeadlineType = 'quarterly' | 'annual' | 'vat' | 'self-assessment';
export type UrgencyLevel = 'safe' | 'warning' | 'critical';

export interface Deadline {
  id: string;
  title: string;
  dueDate: Date | string;
  daysLeft: number;
  type: string;
  category?: DeadlineCategory;
  description: string;
  penaltyInfo?: string;
  paymentUrl?: string;
  completed?: boolean;
  country?: string;
  urgency?: UrgencyLevel;
  // Compatibility fields while calendar + home surfaces converge.
  isCompleted?: boolean;
  isComplete?: boolean;
}

export type TaxEstimate = {
  quarterlyOwed: number;
  currency: 'USD' | 'GBP' | 'EUR';
  period: string;
  isEstimate: true;
};

export type TaxEstimate = {
  quarterlyOwed: number;
  currency: 'USD' | 'GBP' | 'EUR';
  period: string;
  isEstimate: true;
};
