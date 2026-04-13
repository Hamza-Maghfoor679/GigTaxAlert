/** Germany freelance / USt deadlines (basic defaults). */
export const DE_RULES = [
  {
    id: 'de-income-tax-return',
    name: 'Annual income tax return',
    category: 'income_tax',
    due: { month: 7, day: 31 },
    description: 'Submit your annual return to Finanzamt (or by extension date when applicable).',
    penalty: 'Late filing penalties and interest may apply.',
    payment_url: 'https://www.elster.de',
    applies_to: ['all'],
  },
  {
    id: 'de-vat-q1',
    name: 'VAT return (Q1)',
    category: 'vat',
    due: { month: 4, day: 10 },
    description: 'Submit and pay VAT for the first quarter.',
    penalty: 'Late VAT filings can trigger surcharges and interest.',
    payment_url: 'https://www.elster.de',
    applies_to: ['all'],
  },
];
