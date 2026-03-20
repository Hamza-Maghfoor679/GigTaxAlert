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
