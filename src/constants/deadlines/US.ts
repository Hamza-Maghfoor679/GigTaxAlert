/** US quarterly estimated tax + 1099 / NEC filing reminders (expand as needed). */
export const US_QUARTERLY_DUE_MONTHS = [4, 6, 9, 1] as const;

export const US_DEADLINE_RULES = {
  estimatedTax: 'Quarterly federal estimated tax (Form 1040-ES).',
  form1099NEC: 'Issue 1099-NEC to contractors; file with IRS by deadline.',
} as const;
