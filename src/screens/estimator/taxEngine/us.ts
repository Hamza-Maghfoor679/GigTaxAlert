import { clampNonNegative, progressiveTax, roundMoney } from './shared';
import type { CountryTaxCalculator } from './types';

const FEDERAL_BRACKETS = [
  { upTo: 11_600, rate: 0.1 },
  { upTo: 47_150, rate: 0.12 },
  { upTo: 100_525, rate: 0.22 },
  { upTo: 191_950, rate: 0.24 },
  { upTo: 243_725, rate: 0.32 },
  { upTo: 609_350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
] as const;

const DEFAULT_STANDARD_DEDUCTION = 14_600;

export const calculateUSTax: CountryTaxCalculator = (taxableNetIncome, options) => {
  const net = clampNonNegative(taxableNetIncome);
  const selfEmploymentTax = roundMoney(net * 0.9235 * 0.153);
  const seDeduction = selfEmploymentTax * 0.5;
  const standardDeduction = options.applyStandardDeduction ? DEFAULT_STANDARD_DEDUCTION : 0;
  const federalTaxable = clampNonNegative(net - seDeduction - standardDeduction);
  const federalTax = progressiveTax(federalTaxable, FEDERAL_BRACKETS);

  return {
    federalTax,
    selfEmploymentTax,
    vat: 0,
    socialContributions: 0,
  };
};
