export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export type IncomeEntry = {
  id: string;
  quarter: Quarter;
  year: number;
  grossIncome: number;
  deductions: number;
  savedAt: string;
};

export type TaxBreakdown = {
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  seTax: number;
  incomeTax: number;
  totalOwed: number;
  effectiveRate: number;
};

export type QuarterSummary = {
  quarter: Quarter;
  grossIncome: number;
  estimatedTax: number;
  hasData: boolean;
};

export type EstimatorFormState = {
  grossIncome: string;
  deductions: string;
};
