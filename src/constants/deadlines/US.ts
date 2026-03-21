/** US quarterly estimated tax + 1099 / NEC filing reminders (expand as needed). */
export const US_QUARTERLY_DUE_MONTHS = [4, 6, 9, 1] as const;

export const US_DEADLINE_RULES = {
  estimatedTax: 'Quarterly federal estimated tax (Form 1040-ES).',
  form1099NEC: 'Issue 1099-NEC to contractors; file with IRS by deadline.',
} as const;

// constants/deadlines/US.ts
export const US_RULES = [
  {
    id: 'us-q1-est',
    name: 'Q1 estimated tax payment',
    category: 'estimated_tax',
    due: { month: 4, day: 15 },
    description: 'Pay 25% of your expected annual tax to the IRS.',
    penalty: '0.5% per month on unpaid amount',
    payment_url: 'https://www.irs.gov/payments',
    applies_to: ['all'],
    tier: 'free'
  },
  {
    id: 'us-q2-est',
    name: 'Q2 estimated tax payment',
    due: { month: 6, day: 17 },
    // ...
  },
  {
    id: 'us-1099-nec',
    name: '1099-NEC filing deadline',
    category: '1099',
    due: { month: 1, day: 31 },
    description: 'File 1099-NEC for each contractor paid $600+.',
    tier: 'free'
  }
  // Q3 Sep 16, Q4 Jan 15, 1099 Jan 31...
]

