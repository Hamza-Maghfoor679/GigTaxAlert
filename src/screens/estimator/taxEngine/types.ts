export type PeriodMode = 'quarterly' | 'yearly';
export type SupportedTaxCountry = 'US' | 'GB' | 'DE' | 'FR' | 'NL';
export type CurrencyCode = 'USD' | 'GBP' | 'EUR';

export type TaxEngineInput = {
  grossIncome: number;
  expenses: number;
  country: string;
  vatRegistered?: boolean;
  applyStandardDeduction?: boolean;
  periodMode?: PeriodMode;
};

export type TaxComponents = {
  federalTax: number;
  selfEmploymentTax: number;
  vat: number;
  socialContributions: number;
};

export type TaxEngineOutput = {
  grossIncome: number;
  expenses: number;
  netIncome: number;
  taxOwed: number;
  safeToSpend: number;
  effectiveTaxRate: number;
  currency: CurrencyCode;
  isEstimate: true;
  breakdown: TaxComponents;
};

export type CountryTaxCalculator = (
  taxableNetIncome: number,
  options: TaxEngineInput,
) => TaxComponents;
