/** France micro / reel simplified reminders (basic defaults). */
export const FR_RULES = [
  {
    id: 'fr-income-tax-return',
    name: 'Annual income tax return',
    category: 'income_tax',
    due: { month: 5, day: 31 },
    description: 'Submit your annual income declaration by your online filing deadline.',
    penalty: 'Late declarations may trigger percentage penalties and interest.',
    payment_url: 'https://www.impots.gouv.fr',
    applies_to: ['all'],
  },
  {
    id: 'fr-vat-q1',
    name: 'VAT return (Q1)',
    category: 'vat',
    due: { month: 4, day: 24 },
    description: 'Submit and pay VAT for the first quarter.',
    penalty: 'Late VAT declaration/payment penalties may apply.',
    payment_url: 'https://www.impots.gouv.fr',
    applies_to: ['all'],
  },
];
