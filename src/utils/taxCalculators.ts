/** Self-employment / schedule C style effective rate helper (placeholder). */
export function estimateSelfEmploymentTax(
  netProfit: number,
  seTaxRate: number = 0.153,
): number {
  if (netProfit <= 0) {
    return 0;
  }
  return Math.round(netProfit * seTaxRate * 100) / 100;
}

export function applyVat(amount: number, rate: number): number {
  return Math.round(amount * (1 + rate) * 100) / 100;
}

export const TAX_RATES = {
  US: {
    se_tax_rate: 0.153,           // 15.3% self-employment tax
    se_deduction: 0.5,            // deduct half SE tax from income
    brackets_2024: [
      { min: 0,      max: 11600, rate: 0.10 },
      { min: 11600,  max: 47150, rate: 0.12 },
      { min: 47150,  max: 100525,rate: 0.22 },
      // ...
    ],
    standard_deduction: 14600,
    quarterly_safe_harbor: 0.25   // pay 25% of prior year tax per quarter
  },
  UK: {
    personal_allowance: 12570,
    basic_rate: 0.20,             // up to £50,270
    higher_rate: 0.40,            // £50,271–£125,140
    ni_class4_rate: 0.09,         // National Insurance Class 4
    ni_class4_lower: 12570,
    ni_class4_upper: 50270,
    vat_threshold: 85000,         // register for VAT above this
    vat_standard_rate: 0.20,
  },
  DE: {
    income_tax_basic: 10908,      // tax-free allowance
    solidarity_surcharge_threshold: 17543,
    trade_tax_base_rate: 0.035,
  }
  // FR, NL similar...
}