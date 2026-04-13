export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface EstimatorFormState {
  grossIncome: string; // string because it's raw TextInput value
  deductions: string; // string because it's raw TextInput value
}

export interface TaxBreakdown {
  grossIncome: number;
  deductions: number;
  netIncome: number;
  incomeTax: number;
  selfEmploymentTax: number;
  totalOwed: number;
  effectiveRate: number; // percentage e.g. 27.5
  effectiveTaxRate: number; // decimal ratio e.g. 0.275
  safeAmount: number; // grossIncome - totalOwed, floor 0
  currency: string; // "USD" | "GBP" | "EUR"
  period: string; // "Q2 2026"
  isEstimate: true;
  breakdown: {
    federalTax: number;
    selfEmploymentTax: number;
    vat: number;
    socialContributions: number;
  };
  // Used by existing TaxBreakdownCard display.
  taxableIncome: number;
  seTax: number;
}

export interface QuarterSummary {
  quarter: Quarter;
  year: number;
  grossIncome: number;
  estimatedTax: number;
  hasData: boolean;
  savedAt: Date | null;
}
