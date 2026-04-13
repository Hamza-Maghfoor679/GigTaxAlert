import { clampNonNegative, progressiveTax, roundMoney } from './shared';
import type { CountryTaxCalculator } from './types';

const UK_BRACKETS = [
  { upTo: 37_700, rate: 0.2 },
  { upTo: 125_140, rate: 0.4 },
  { upTo: Infinity, rate: 0.45 },
] as const;

const PERSONAL_ALLOWANCE = 12_570;

export const calculateUKTax: CountryTaxCalculator = (taxableNetIncome) => {
  const net = clampNonNegative(taxableNetIncome);
  const taxable = clampNonNegative(net - PERSONAL_ALLOWANCE);
  const federalTax = progressiveTax(taxable, UK_BRACKETS);

  let socialContributions = 0;
  if (net > 12_570) {
    socialContributions += (Math.min(net, 50_270) - 12_570) * 0.09;
  }
  if (net > 50_270) {
    socialContributions += (net - 50_270) * 0.02;
  }

  return {
    federalTax,
    selfEmploymentTax: 0,
    vat: 0,
    socialContributions: roundMoney(socialContributions),
  };
};
