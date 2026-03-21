import { TaxBreakdown } from '../types/estimator.types';

const SE_TAX_RATE = 0.153;

const BRACKETS = [
  { upTo: 11_600, rate: 0.1 },
  { upTo: 47_150, rate: 0.12 },
  { upTo: 100_525, rate: 0.22 },
  { upTo: 191_950, rate: 0.24 },
  { upTo: 243_725, rate: 0.32 },
  { upTo: 609_350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

const clamp = (n: number) => Math.max(0, n);

const calcIncomeTax = (quarterlyTaxableIncome: number): number => {
  const annual = quarterlyTaxableIncome * 4;
  let tax = 0;
  let prev = 0;

  for (const { upTo, rate } of BRACKETS) {
    if (annual <= prev) break;
    tax += (Math.min(annual, upTo) - prev) * rate;
    prev = upTo;
  }

  return tax / 4;
};

export const calcTaxBreakdown = (
  grossIncomeStr: string,
  deductionsStr: string,
): TaxBreakdown => {
  const grossIncome = clamp(parseFloat(grossIncomeStr) || 0);
  const deductions = clamp(parseFloat(deductionsStr) || 0);
  const taxableIncome = clamp(grossIncome - deductions);

  const seTax = taxableIncome * 0.9235 * SE_TAX_RATE;
  const adjustedIncome = clamp(taxableIncome - seTax / 2);
  const incomeTax = calcIncomeTax(adjustedIncome);

  const totalOwed = seTax + incomeTax;
  const effectiveRate = grossIncome > 0 ? (totalOwed / grossIncome) * 100 : 0;

  return {
    grossIncome,
    deductions,
    taxableIncome,
    seTax,
    incomeTax,
    totalOwed,
    effectiveRate,
  };
};

export const safeToSpend = (grossIncome: number, totalOwed: number): number =>
  clamp(grossIncome - totalOwed);
