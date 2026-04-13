/** Netherlands BTW / income tax reminders (basic defaults). */
export const NL_RULES = [
  {
    id: 'nl-income-tax-return',
    name: 'Annual income tax return',
    category: 'income_tax',
    due: { month: 5, day: 1 },
    description: 'File your annual income tax return to Belastingdienst.',
    penalty: 'Late filing penalties may apply.',
    payment_url: 'https://www.belastingdienst.nl',
    applies_to: ['all'],
  },
  {
    id: 'nl-vat-q1',
    name: 'VAT return (Q1)',
    category: 'vat',
    due: { month: 4, day: 30 },
    description: 'Submit and pay your Q1 VAT return.',
    penalty: 'Late VAT submissions can trigger fines and interest.',
    payment_url: 'https://www.belastingdienst.nl',
    applies_to: ['all'],
  },
];
