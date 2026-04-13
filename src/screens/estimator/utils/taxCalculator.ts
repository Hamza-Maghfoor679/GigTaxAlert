import { TaxBreakdown } from '../types/estimator.types';
import { calculateBreakdown } from './calculateBreakdown';

const clamp = (n: number) => Math.max(0, Number.isFinite(n) ? n : 0);

export const calcTaxBreakdown = (
  grossIncomeStr: string,
  deductionsStr: string,
): TaxBreakdown => {
  return calculateBreakdown(
    clamp(parseFloat(grossIncomeStr) || 0),
    clamp(parseFloat(deductionsStr) || 0),
    'US',
  );
};

export const safeToSpend = (netIncome: number, totalOwed: number): number =>
  clamp(netIncome - totalOwed);
