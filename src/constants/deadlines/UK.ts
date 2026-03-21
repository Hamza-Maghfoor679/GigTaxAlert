/** UK self-assessment + VAT milestones (placeholder copy). */
export const UK_SELF_ASSESSMENT = {
  registerBy: 'Register for Self Assessment by 5 October after tax year end.',
  fileOnline: 'File online by 31 January following tax year end.',
  payBalancing: 'Pay balancing payment by 31 January.',
} as const;

export const UK_VAT_RULES = {
  quarterly: 'VAT quarters depend on your VAT stagger group.',
} as const;


// constants/deadlines/UK.ts
export const UK_RULES = [
  {
    id: 'uk-sa-online',
    name: 'Self-assessment online deadline',
    category: 'self_assessment',
    due: { month: 1, day: 31 },
    description: 'File your tax return online for the previous tax year.',
    penalty: '£100 immediate fine if late',
    payment_url: 'https://www.gov.uk/self-assessment-tax-returns',
    tier: 'free'
  },
  {
    id: 'uk-payment-jan',
    name: 'Tax payment deadline',
    due: { month: 1, day: 31 },
    tier: 'free'
  },
  {
    id: 'uk-vat-q1',
    name: 'VAT return Q1',
    category: 'vat',
    due: { month: 5, day: 7 },  // 1 month + 7 days after quarter end
    applies_to: ['vat_registered'],
    tier: 'free'
  }
  // + VAT Q2, Q3, Q4, payments on account...
]