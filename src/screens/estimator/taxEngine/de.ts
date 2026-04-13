import { clampNonNegative, progressiveTax, roundMoney } from './shared';
import type { CountryTaxCalculator } from './types';

const DE_BRACKETS = [
  { upTo: 10_908, rate: 0 },
  { upTo: 62_809, rate: 0.14 },
  { upTo: 277_825, rate: 0.42 },
  { upTo: Infinity, rate: 0.45 },
] as const;

export const calculateDETax: CountryTaxCalculator = (taxableNetIncome) => {
  const net = clampNonNegative(taxableNetIncome);
  const federalTax = progressiveTax(net, DE_BRACKETS);
  const socialContributions = roundMoney(net * 0.18);

  return {
    federalTax,
    selfEmploymentTax: 0,
    vat: 0,
    socialContributions,
  };
};
