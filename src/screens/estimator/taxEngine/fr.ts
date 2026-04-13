import { clampNonNegative, progressiveTax, roundMoney } from './shared';
import type { CountryTaxCalculator } from './types';

const FR_BRACKETS = [
  { upTo: 11_294, rate: 0 },
  { upTo: 28_797, rate: 0.11 },
  { upTo: 82_341, rate: 0.3 },
  { upTo: 177_106, rate: 0.41 },
  { upTo: Infinity, rate: 0.45 },
] as const;

export const calculateFRTax: CountryTaxCalculator = (taxableNetIncome) => {
  const net = clampNonNegative(taxableNetIncome);
  const federalTax = progressiveTax(net, FR_BRACKETS);
  const socialContributions = roundMoney(net * 0.22);

  return {
    federalTax,
    selfEmploymentTax: 0,
    vat: 0,
    socialContributions,
  };
};
