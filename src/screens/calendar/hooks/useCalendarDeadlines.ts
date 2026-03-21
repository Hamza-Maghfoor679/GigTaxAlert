import { useCallback, useEffect, useState } from 'react';

import { Deadline } from '@/components/ui/homeComponents/deadline.types';

type UseCalendarDeadlinesReturn = {
  deadlines: Deadline[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleComplete: (id: string, current: boolean) => void;
};

export function useCalendarDeadlines(): UseCalendarDeadlinesReturn {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeadlines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setDeadlines(MOCK_DEADLINES);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deadlines');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleComplete = useCallback((id: string, current: boolean) => {
    setDeadlines((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              isCompleted: !current,
              completedAt: !current ? new Date().toISOString() : undefined,
            }
          : d,
      ),
    );
  }, []);

  useEffect(() => {
    void fetchDeadlines();
  }, [fetchDeadlines]);

  return { deadlines, loading, error, refetch: fetchDeadlines, toggleComplete };
}

const MOCK_DEADLINES: Deadline[] = [
  {
    id: '1',
    title: 'Q1 Estimated Tax',
    dueDate: '2025-04-15',
    daysLeft: 26,
    category: 'quarterly',
    isCompleted: false,
    description:
      'Pay your first quarterly estimated federal income tax installment for self-employed income earned Jan-Mar.',
    penaltyInfo:
      'A 0.5% monthly penalty applies on any unpaid amount, plus interest at the federal rate.',
    paymentUrl: 'https://www.irs.gov/payments',
  },
  {
    id: '2',
    title: 'Self-Employment Tax',
    dueDate: '2025-04-01',
    daysLeft: 12,
    category: 'self_employment',
    isCompleted: false,
    description: 'Social Security and Medicare taxes (15.3%) on your net self-employment income.',
    penaltyInfo: 'Failure to pay may result in a penalty of 0.5% per month of the unpaid amount.',
    paymentUrl: 'https://www.irs.gov/payments',
  },
  {
    id: '3',
    title: 'State Income Tax Filing',
    dueDate: '2025-05-01',
    daysLeft: 42,
    category: 'income_tax',
    isCompleted: false,
    description: 'File your state income tax return with all freelance and 1099 income declared.',
    penaltyInfo: 'Late filing penalties of 5% per month up to 25% of unpaid tax.',
    paymentUrl: 'https://www.state.gov/taxes',
  },
  {
    id: '4',
    title: '1099 Filing Deadline',
    dueDate: '2025-06-15',
    daysLeft: 87,
    category: 'other',
    isCompleted: false,
    description: 'Submit all 1099-NEC forms to contractors paid over $600 during the year.',
    penaltyInfo: '$50-$280 penalty per late form depending on how late it is filed.',
    paymentUrl: 'https://www.irs.gov/payments',
  },
  {
    id: '5',
    title: 'Q2 Estimated Tax',
    dueDate: '2025-06-16',
    daysLeft: 88,
    category: 'quarterly',
    isCompleted: false,
    description: 'Second quarterly estimated federal income tax payment for Apr-Jun income.',
    penaltyInfo: 'Underpayment penalty applies if less than 90% of owed tax is paid.',
    paymentUrl: 'https://www.irs.gov/payments',
  },
  {
    id: '6',
    title: 'VAT Return Q1',
    dueDate: '2025-04-30',
    daysLeft: 41,
    category: 'vat',
    isCompleted: false,
    description: 'Submit your Q1 VAT return if your turnover exceeds the registration threshold.',
    penaltyInfo: 'Surcharge of 2%-15% depending on number of defaults within a 12-month period.',
    paymentUrl: 'https://www.gov.uk/pay-vat',
  },
  {
    id: '7',
    title: 'Annual Tax Return',
    dueDate: '2025-10-15',
    daysLeft: 209,
    category: 'income_tax',
    isCompleted: false,
    description: 'File your annual federal income tax return (extended deadline).',
    penaltyInfo: '5% per month on unpaid tax, up to 25%. Plus interest on unpaid balance.',
    paymentUrl: 'https://www.irs.gov/payments',
  },
  {
    id: '8',
    title: 'Q3 Estimated Tax',
    dueDate: '2025-09-15',
    daysLeft: 178,
    category: 'quarterly',
    isCompleted: true,
    completedAt: '2025-03-10T10:00:00Z',
    description: 'Third quarterly estimated federal income tax payment for Jul-Sep income.',
    penaltyInfo: 'Underpayment penalty applies if less than 90% of owed tax is paid.',
    paymentUrl: 'https://www.irs.gov/payments',
  },
];
