import { calculateDETax } from './de';
import { calculateFRTax } from './fr';
import { calculateNLTax } from './nl';
import { currencyForCountry, normalizeCountry, roundMoney, safeDivide } from './shared';
import { calculateUKTax } from './uk';
import { calculateUSTax } from './us';
import type { CountryTaxCalculator, TaxEngineInput, TaxEngineOutput } from './types';

const VAT_RATE_BY_COUNTRY: Record<'GB' | 'DE' | 'FR' | 'NL', number> = {
  GB: 0.2,
  DE: 0.19,
  FR: 0.2,
  NL: 0.21,
};

function getCountryCalculator(country: string): CountryTaxCalculator {
  const code = normalizeCountry(country);
  switch (code) {
    case 'GB':
      return calculateUKTax;
    case 'DE':
      return calculateDETax;
    case 'FR':
      return calculateFRTax;
    case 'NL':
      return calculateNLTax;
    case 'US':
    default:
      return calculateUSTax;
  }
}

function vatExclusionAmount(grossIncome: number, country: string, vatRegistered: boolean): number {
  const code = normalizeCountry(country);
  if (!vatRegistered || code === 'US') return 0;

  const rate = VAT_RATE_BY_COUNTRY[code as keyof typeof VAT_RATE_BY_COUNTRY] ?? 0.2;
  if (rate <= 0) return 0;

  // Assumes gross includes VAT; strip VAT portion so it is not taxed as income.
  return roundMoney(grossIncome - grossIncome / (1 + rate));
}

export function calculateTax(
  netIncome: number,
  country: string,
  options: Pick<TaxEngineInput, 'vatRegistered' | 'applyStandardDeduction' | 'periodMode'> = {},
) {
  const calculator = getCountryCalculator(country);
  return calculator(netIncome, {
    grossIncome: 0,
    expenses: 0,
    ...options,
    country,
  });
}

export function computeTaxEstimate(input: TaxEngineInput): TaxEngineOutput {
  const grossIncome = roundMoney(Math.max(0, input.grossIncome));
  const expenses = roundMoney(Math.max(0, input.expenses));
  const vat = vatExclusionAmount(grossIncome, input.country, Boolean(input.vatRegistered));
  const taxableGross = roundMoney(Math.max(0, grossIncome - vat));
  const netIncome = roundMoney(Math.max(0, taxableGross - expenses));
  const components = calculateTax(netIncome, input.country, input);

  const taxOwed = roundMoney(
    components.federalTax +
      components.selfEmploymentTax +
      components.socialContributions,
  );
  const safeToSpend = roundMoney(Math.max(0, netIncome - taxOwed));
  const effectiveTaxRate = safeDivide(taxOwed, grossIncome);

  return {
    grossIncome,
    expenses,
    netIncome,
    taxOwed,
    safeToSpend,
    effectiveTaxRate,
    currency: currencyForCountry(normalizeCountry(input.country)),
    isEstimate: true,
    breakdown: {
      federalTax: components.federalTax,
      selfEmploymentTax: components.selfEmploymentTax,
      vat,
      socialContributions: components.socialContributions,
    },
  };
}
