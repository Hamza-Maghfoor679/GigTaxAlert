import type { TaxBreakdown } from '../types/estimator.types';
import { computeTaxEstimate } from '../taxEngine';

function roundCurrency(value: number): number {
  return Math.round(Number.isFinite(value) ? value : 0);
}

export function calculateBreakdown(
  grossIncome: number,
  deductions: number,
  country: string,
  options?: {
    vatRegistered?: boolean;
    applyStandardDeduction?: boolean;
    periodMode?: 'quarterly' | 'yearly';
  },
): TaxBreakdown {
  const gross = roundCurrency(Math.max(0, grossIncome));
  const ded = roundCurrency(Math.max(0, deductions));
  const estimate = computeTaxEstimate({
    grossIncome: gross,
    expenses: ded,
    country,
    vatRegistered: options?.vatRegistered ?? false,
    applyStandardDeduction: options?.applyStandardDeduction ?? true,
    periodMode: options?.periodMode ?? 'quarterly',
  });

  const totalOwed = roundCurrency(estimate.taxOwed);
  const safeAmount = roundCurrency(estimate.safeToSpend);
  const effectiveTaxRate = estimate.effectiveTaxRate;
  const effectiveRate = effectiveTaxRate * 100;
  const month = new Date().getMonth();
  const currentQuarter = month < 3 ? 'Q1' : month < 6 ? 'Q2' : month < 9 ? 'Q3' : 'Q4';
  const period = `${currentQuarter} ${new Date().getFullYear()}`;

  return {
    grossIncome: gross,
    deductions: ded,
    netIncome: roundCurrency(estimate.netIncome),
    incomeTax: roundCurrency(estimate.breakdown.federalTax),
    selfEmploymentTax: roundCurrency(
      estimate.breakdown.selfEmploymentTax + estimate.breakdown.socialContributions,
    ),
    totalOwed,
    effectiveRate: roundCurrency(effectiveRate * 100) / 100,
    effectiveTaxRate: roundCurrency(effectiveTaxRate * 10000) / 10000,
    safeAmount,
    currency: estimate.currency,
    period,
    isEstimate: true,
    breakdown: estimate.breakdown,
    taxableIncome: roundCurrency(estimate.netIncome),
    seTax: roundCurrency(
      estimate.breakdown.selfEmploymentTax + estimate.breakdown.socialContributions,
    ),
  };
}
