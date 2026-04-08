import type { TaxBreakdown } from '../types/estimator.types';

function roundCurrency(value: number): number {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function applyUSBrackets(taxable: number): number {
  const amount = Math.max(0, taxable);
  const brackets = [
    { upTo: 11_600, rate: 0.1 },
    { upTo: 47_150, rate: 0.12 },
    { upTo: 100_525, rate: 0.22 },
    { upTo: 191_950, rate: 0.24 },
    { upTo: 243_725, rate: 0.32 },
    { upTo: 609_350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ] as const;

  let total = 0;
  let previous = 0;

  for (const bracket of brackets) {
    if (amount <= previous) break;
    const taxableInBracket = Math.min(amount, bracket.upTo) - previous;
    total += taxableInBracket * bracket.rate;
    previous = bracket.upTo;
  }

  return roundCurrency(total);
}

function applyGermanBrackets(netIncome: number): number {
  const income = Math.max(0, netIncome);
  if (income <= 10_908) return 0;
  if (income <= 15_999) return roundCurrency((income - 10_908) * 0.14);
  if (income <= 62_809) return roundCurrency((15_999 - 10_908) * 0.14 + (income - 15_999) * 0.3);
  if (income <= 277_825) {
    return roundCurrency((15_999 - 10_908) * 0.14 + (62_809 - 15_999) * 0.3 + (income - 62_809) * 0.42);
  }
  return roundCurrency(
    (15_999 - 10_908) * 0.14 +
      (62_809 - 15_999) * 0.3 +
      (277_825 - 62_809) * 0.42 +
      (income - 277_825) * 0.45,
  );
}

export function calculateBreakdown(
  grossIncome: number,
  deductions: number,
  country: string,
): TaxBreakdown {
  const gross = roundCurrency(Math.max(0, grossIncome));
  const ded = roundCurrency(Math.max(0, deductions));
  const netIncome = roundCurrency(gross - ded);
  const countryCode = country.toUpperCase();

  let incomeTax = 0;
  let selfEmploymentTax = 0;

  if (countryCode === 'US') {
    const seRaw =
      netIncome <= 0
        ? 0
        : netIncome <= 160_200
          ? netIncome * 0.153
          : 160_200 * 0.153 + (netIncome - 160_200) * 0.029;

    selfEmploymentTax = roundCurrency(seRaw);
    const seDeduction = selfEmploymentTax * 0.5;
    const taxableIncome = Math.max(0, netIncome - seDeduction - 14_600);
    incomeTax = applyUSBrackets(taxableIncome);
  } else if (countryCode === 'UK') {
    const personalAllowance = 12_570;
    const taxableIncome = Math.max(0, netIncome - personalAllowance);
    let incomeTaxRaw = 0;

    const basicBand = Math.min(taxableIncome, 37_700);
    incomeTaxRaw += basicBand * 0.2;

    const higherBand = Math.min(Math.max(0, taxableIncome - 37_700), 75_000);
    incomeTaxRaw += higherBand * 0.4;

    const additionalBand = Math.max(0, taxableIncome - 37_700 - 75_000);
    incomeTaxRaw += additionalBand * 0.45;
    incomeTax = roundCurrency(incomeTaxRaw);

    let ni = 0;
    if (netIncome > 12_570) {
      ni += (Math.min(netIncome, 50_270) - 12_570) * 0.09;
    }
    if (netIncome > 50_270) {
      ni += (netIncome - 50_270) * 0.02;
    }
    selfEmploymentTax = roundCurrency(ni);
  } else if (countryCode === 'DE' || countryCode === 'FR' || countryCode === 'NL') {
    incomeTax = applyGermanBrackets(netIncome);
    selfEmploymentTax = roundCurrency(netIncome * 0.15);
  } else {
    const seRaw =
      netIncome <= 0
        ? 0
        : netIncome <= 160_200
          ? netIncome * 0.153
          : 160_200 * 0.153 + (netIncome - 160_200) * 0.029;
    selfEmploymentTax = roundCurrency(seRaw);
    const seDeduction = selfEmploymentTax * 0.5;
    const taxableIncome = Math.max(0, netIncome - seDeduction - 14_600);
    incomeTax = applyUSBrackets(taxableIncome);
  }

  const totalOwed = roundCurrency(incomeTax + selfEmploymentTax);
  const effectiveRate = gross > 0 ? (totalOwed / gross) * 100 : 0;
  const safeAmount = Math.max(0, roundCurrency(gross - totalOwed));
  const currency =
    countryCode === 'US' ? 'USD' : countryCode === 'UK' ? 'GBP' : 'EUR';
  const month = new Date().getMonth();
  const currentQuarter = month < 3 ? 'Q1' : month < 6 ? 'Q2' : month < 9 ? 'Q3' : 'Q4';
  const period = `${currentQuarter} ${new Date().getFullYear()}`;

  return {
    grossIncome: gross,
    deductions: ded,
    netIncome,
    incomeTax,
    selfEmploymentTax,
    totalOwed,
    effectiveRate: roundCurrency(effectiveRate * 100) / 100,
    safeAmount,
    currency,
    period,
    taxableIncome: netIncome,
    seTax: selfEmploymentTax,
  };
}
