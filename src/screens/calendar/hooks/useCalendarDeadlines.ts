import { getAuth } from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import type { Deadline, DeadlineCategory } from '@/components/ui/homeComponents/deadline.types';
import type { UserDoc } from '@/types/schemas/user';

type UseCalendarDeadlinesReturn = {
  deadlines: Deadline[];
  loading: boolean;
  refetch: () => Promise<void>;
  toggleComplete: (id: string) => void;
};

type DeadlineStatusDoc = {
  completed: boolean;
  updatedAt?: unknown;
};

type DeadlineRule = {
  id: string;
  title: string;
  dueDate: string;
  type: DeadlineCategory;
  category: DeadlineCategory;
  description: string;
  penaltyInfo: string;
  paymentUrl?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const US_2026_RULES: DeadlineRule[] = [
  {
    id: 'us-2026-q1-estimated',
    title: 'Q1 Estimated Tax',
    dueDate: '2026-04-15',
    type: 'quarterly',
    category: 'quarterly',
    description: 'Pay estimated taxes for income you earned from January through March.',
    penaltyInfo: 'Paying late can trigger interest and underpayment penalties from the IRS.',
    paymentUrl: 'https://www.irs.gov/payments',
  },
  {
    id: 'us-2026-q2-estimated',
    title: 'Q2 Estimated Tax',
    dueDate: '2026-06-16',
    type: 'quarterly',
    category: 'quarterly',
    description: 'Pay estimated taxes for income you earned in April and May.',
    penaltyInfo: 'If this payment is missed, the IRS may add late-payment interest and penalties.',
    paymentUrl: 'https://www.irs.gov/payments',
  },
  {
    id: 'us-2026-q3-estimated',
    title: 'Q3 Estimated Tax',
    dueDate: '2026-09-15',
    type: 'quarterly',
    category: 'quarterly',
    description: 'Pay estimated taxes for income you earned from June through August.',
    penaltyInfo: 'Missing this date can increase what you owe with additional IRS charges.',
    paymentUrl: 'https://www.irs.gov/payments',
  },
  {
    id: 'us-2026-q4-estimated',
    title: 'Q4 Estimated Tax',
    dueDate: '2027-01-15',
    type: 'quarterly',
    category: 'quarterly',
    description: 'Make your final estimated payment for income earned from September through December.',
    penaltyInfo: 'Late Q4 estimated payments can still result in underpayment penalties.',
    paymentUrl: 'https://www.irs.gov/payments',
  },
  {
    id: 'us-2026-annual-return',
    title: 'Annual Federal Return',
    dueDate: '2026-04-15',
    type: 'income_tax',
    category: 'income_tax',
    description: 'File your federal return for the year and report your freelance income and deductions.',
    penaltyInfo: 'Filing late may lead to failure-to-file penalties plus interest on unpaid tax.',
  },
  {
    id: 'us-2026-self-employment',
    title: 'Self-Employment Tax Filing',
    dueDate: '2026-04-15',
    type: 'self_employment',
    category: 'self_employment',
    description: 'Report and file self-employment taxes for your freelance work.',
    penaltyInfo: 'Late filing or payment can increase your balance with penalties and interest.',
  },
  {
    id: 'us-2026-1099-nec',
    title: '1099-NEC Receipt Deadline',
    dueDate: '2026-01-31',
    type: 'other',
    category: 'other',
    description: 'By this date, you should have received your 1099-NEC forms from clients who issued them.',
    penaltyInfo: 'Missing forms can cause filing errors, delays, or corrected returns later.',
  },
];

function daysLeftFromIso(isoDate: string): number {
  const today = new Date();
  const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = isoDate.split('-').map(Number);
  const utcDue = Date.UTC(year, month - 1, day);
  return Math.ceil((utcDue - utcToday) / DAY_MS);
}

function toDeadline(rule: DeadlineRule, completed: boolean): Deadline {
  return {
    id: rule.id,
    title: rule.title,
    dueDate: rule.dueDate,
    daysLeft: daysLeftFromIso(rule.dueDate),
    type: rule.type,
    category: rule.category,
    description: rule.description,
    penaltyInfo: rule.penaltyInfo,
    paymentUrl: rule.paymentUrl,
    completed,
  };
}

export function useCalendarDeadlines(): UseCalendarDeadlinesReturn {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeadlines = useCallback(async () => {
    setLoading(true);
    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) {
        setDeadlines([]);
        return;
      }

      const firestore = getFirestore();
      const userSnap = await getDoc(doc(collection(firestore, 'users'), uid));
      if (!userSnap.exists) {
        setDeadlines([]);
        return;
      }

      const user = userSnap.data() as UserDoc;
      if (user.country !== 'US' || user.freelanceType !== 'developer') {
        setDeadlines([]);
        return;
      }

      const statusSnap = await getDocs(collection(doc(collection(firestore, 'users'), uid), 'deadlineStatus'));
      const completionById = new Map<string, boolean>();
      statusSnap.docs.forEach((deadlineDoc) => {
        const status = deadlineDoc.data() as DeadlineStatusDoc;
        completionById.set(deadlineDoc.id, Boolean(status.completed));
      });

      const generated = US_2026_RULES.map((rule) => toDeadline(rule, completionById.get(rule.id) ?? false));
      setDeadlines(generated);
    } catch {
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleComplete = useCallback((id: string) => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const current = deadlines.find((deadline) => deadline.id === id)?.completed ?? false;
    const next = !current;
    setDeadlines((prev) => prev.map((deadline) => (deadline.id === id ? { ...deadline, completed: next } : deadline)));

    const firestore = getFirestore();
    const statusRef = doc(collection(doc(collection(firestore, 'users'), uid), 'deadlineStatus'), id);
    void setDoc(
      statusRef,
      {
        completed: next,
        updatedAt: serverTimestamp(),
      } satisfies DeadlineStatusDoc,
      { merge: true },
    );
  }, [deadlines]);

  const refetch = useCallback(async () => {
    await fetchDeadlines();
  }, [fetchDeadlines]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { deadlines, loading, refetch, toggleComplete };
}
