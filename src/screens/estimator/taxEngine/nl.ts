import { clampNonNegative, progressiveTax, roundMoney } from './shared';
import type { CountryTaxCalculator } from './types';

const NL_BRACKETS = [
  { upTo: 75_518, rate: 0.3697 },
  { upTo: Infinity, rate: 0.495 },
] as const;

export const calculateNLTax: CountryTaxCalculator = (taxableNetIncome) => {
  const net = clampNonNegative(taxableNetIncome);
  const federalTax = progressiveTax(net, NL_BRACKETS);
  const socialContributions = roundMoney(net * 0.12);

  return {
    federalTax,
    selfEmploymentTax: 0,
    vat: 0,
    socialContributions,
  };
};
