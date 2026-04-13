import type { CurrencyCode, SupportedTaxCountry } from './types';

export function clampNonNegative(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function safeDivide(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 0;
  return numerator / denominator;
}

export function progressiveTax(
  income: number,
  brackets: ReadonlyArray<{ upTo: number; rate: number }>,
): number {
  const taxable = clampNonNegative(income);
  let total = 0;
  let previous = 0;

  for (const { upTo, rate } of brackets) {
    if (taxable <= previous) break;
    const inBracket = Math.min(taxable, upTo) - previous;
    total += inBracket * rate;
    previous = upTo;
  }

  return roundMoney(total);
}

export function normalizeCountry(country: string): SupportedTaxCountry {
  const code = (country || '').toUpperCase();
  if (code === 'UK') return 'GB';
  if (code === 'US' || code === 'GB' || code === 'DE' || code === 'FR' || code === 'NL') return code;
  return 'US';
}

export function currencyForCountry(country: SupportedTaxCountry): CurrencyCode {
  switch (country) {
    case 'US':
      return 'USD';
    case 'GB':
      return 'GBP';
    default:
      return 'EUR';
  }
}
