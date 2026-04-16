import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAuth } from '@react-native-firebase/auth';
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

import { useUserProfile } from '@/context/UserProfileContext';
import type { EstimatorFormState, Quarter, QuarterSummary, TaxBreakdown } from '../types/estimator.types';
import { calculateBreakdown } from '../utils/calculateBreakdown';
import { showThemedAlertSimple } from '@/services/themedAlert';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const FIRESTORE_TIMEOUT_MS = 12000;

function withTimeout<T>(promise: Promise<T>, timeoutMs = FIRESTORE_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('REQUEST_TIMEOUT'));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

function getFriendlyFirestoreMessage(error: unknown): string {
  const err = error as { code?: string; message?: string };

  switch (err?.code) {
    case 'firestore/permission-denied':
    case 'permission-denied':
      return 'You do not have permission to save estimates for this account.';
    case 'firestore/failed-precondition':
    case 'failed-precondition':
      return 'Firestore needs an index for estimates query (quarter + year). Please create the suggested index in Firebase console.';
    case 'firestore/unavailable':
    case 'unavailable':
      return 'Network unavailable. Please check your connection and try again.';
    default:
      if (err?.message === 'REQUEST_TIMEOUT') {
        return 'Request timed out. Please try again in a moment.';
      }
      return 'Could not save entry. Try again.';
  }
}

const currentQuarter = (): Quarter => {
  const month = new Date().getMonth();
  if (month < 3) return 'Q1';
  if (month < 6) return 'Q2';
  if (month < 9) return 'Q3';
  return 'Q4';
};

type UseIncomeEstimatorReturn = {
  selectedQuarter: Quarter;
  selectedYear: number;
  setQuarter: (q: Quarter) => void;
  setYear: (y: number) => void;
  form: EstimatorFormState;
  setForm: (partial: Partial<EstimatorFormState>) => void;
  saveEntry: () => Promise<void>;
  isSaving: boolean;
  breakdown: TaxBreakdown;
  safeAmount: number;
  quarterSummaries: QuarterSummary[];
  loading: boolean;
  lastSavedAt: number | null;
};

export function useIncomeEstimator(): UseIncomeEstimatorReturn {
  const { country } = useUserProfile();
  const selectedCountry = country ?? 'US';
  const [selectedQuarter, setQuarter] = useState<Quarter>(currentQuarter());
  const [selectedYear, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [quarterSummaries, setQuarterSummaries] = useState<QuarterSummary[]>(
    QUARTERS.map((quarter) => ({
      quarter,
      year: new Date().getFullYear(),
      grossIncome: 0,
      estimatedTax: 0,
      hasData: false,
      savedAt: null,
    })),
  );
  const mounted = useRef(true);
  const [form, setFormState] = useState<EstimatorFormState>({
    grossIncome: '',
    deductions: '',
  });

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const setForm = useCallback((partial: Partial<EstimatorFormState>) => {
    setFormState((prev) => ({ ...prev, ...partial }));
  }, []);

  const breakdown = useMemo(() => {
    const calculated = calculateBreakdown(
      parseFloat(form.grossIncome) || 0,
      parseFloat(form.deductions) || 0,
      selectedCountry,
      {
        applyStandardDeduction: true,
        vatRegistered: false,
        periodMode: 'quarterly',
      },
    );
    return {
      ...calculated,
      period: `${selectedQuarter} ${selectedYear}`,
    };
  }, [form.grossIncome, form.deductions, selectedCountry, selectedQuarter, selectedYear]);

  const safeAmount = useMemo(() => {
    return Math.max(0, Math.round(breakdown.netIncome - breakdown.totalOwed));
  }, [breakdown.netIncome, breakdown.totalOwed]);

  const loadSelectedQuarterAndYear = useCallback(async () => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      if (!mounted.current) return;
      setFormState({ grossIncome: '', deductions: '' });
      setQuarterSummaries(
        QUARTERS.map((quarter) => ({
          quarter,
          year: selectedYear,
          grossIncome: 0,
          estimatedTax: 0,
          hasData: false,
          savedAt: null,
        })),
      );
      setLoading(false);
      return;
    }

    try {
      const db = getFirestore();
      const estimatesRef = collection(db, 'users', uid, 'estimates');

      const selectedQuarterQuery = query(
        estimatesRef,
        where('quarter', '==', selectedQuarter),
        where('year', '==', selectedYear),
      );
      const yearQuery = query(estimatesRef, where('year', '==', selectedYear));

      const [selectedQuarterSnap, yearSnap] = await Promise.all([
        withTimeout(getDocs(selectedQuarterQuery)),
        withTimeout(getDocs(yearQuery)),
      ]);

      if (!mounted.current) return;

      const selectedDoc = selectedQuarterSnap.docs[0]?.data() as
        | { grossIncome?: number; deductions?: number }
        | undefined;

      setFormState({
        grossIncome:
          selectedDoc && typeof selectedDoc.grossIncome === 'number'
            ? String(Math.round(selectedDoc.grossIncome))
            : '',
        deductions:
          selectedDoc && typeof selectedDoc.deductions === 'number'
            ? String(Math.round(selectedDoc.deductions))
            : '',
      });

      const summaryByQuarter = new Map<Quarter, QuarterSummary>();
      yearSnap.docs.forEach((docSnap) => {
        const data = docSnap.data() as {
          quarter?: string;
          grossIncome?: number;
          totalOwed?: number;
          createdAt?: { toDate?: () => Date };
        };
        if (
          data.quarter !== 'Q1' &&
          data.quarter !== 'Q2' &&
          data.quarter !== 'Q3' &&
          data.quarter !== 'Q4'
        ) {
          return;
        }
        const savedAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
        const gross = Math.round(data.grossIncome ?? 0);
        const owed = Math.round(data.totalOwed ?? 0);
        summaryByQuarter.set(data.quarter, {
          quarter: data.quarter,
          year: selectedYear,
          grossIncome: gross,
          estimatedTax: owed,
          hasData: true,
          savedAt,
        });
      });

      setQuarterSummaries(
        QUARTERS.map((quarter) => {
          const existing = summaryByQuarter.get(quarter);
          if (existing) return existing;
          return {
            quarter,
            year: selectedYear,
            grossIncome: 0,
            estimatedTax: 0,
            hasData: false,
            savedAt: null,
          };
        }),
      );
    } catch (error) {
      console.error('[useIncomeEstimator] load failed:', error);
      if (!mounted.current) return;
      setFormState({ grossIncome: '', deductions: '' });
      setQuarterSummaries(
        QUARTERS.map((quarter) => ({
          quarter,
          year: selectedYear,
          grossIncome: 0,
          estimatedTax: 0,
          hasData: false,
          savedAt: null,
        })),
      );
    } finally {
      if (!mounted.current) return;
      setLoading(false);
    }
  }, [selectedQuarter, selectedYear]);

  useEffect(() => {
    if (!mounted.current) return;
    setLoading(true);
    void loadSelectedQuarterAndYear();
  }, [loadSelectedQuarterAndYear]);

  const saveEntry = useCallback(async () => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const grossIncome = parseFloat(form.grossIncome) || 0;
    if (grossIncome <= 0) {
      showThemedAlertSimple('Enter your gross income first.');
      return;
    }

    setIsSaving(true);
    try {
      const db = getFirestore();
      const estimatesRef = collection(db, 'users', uid, 'estimates');
      const existingQuery = query(
        estimatesRef,
        where('quarter', '==', selectedQuarter),
        where('year', '==', selectedYear),
      );
      const existingSnap = await withTimeout(getDocs(existingQuery));

      const deductions = parseFloat(form.deductions) || 0;
      const netIncome = Math.max(0, Math.round(grossIncome - deductions));
      const estimateDoc = {
        quarter: selectedQuarter,
        year: selectedYear,
        grossIncome: Math.round(grossIncome),
        deductions: Math.round(deductions),
        netIncome,
        totalOwed: Math.round(breakdown.totalOwed),
        country: selectedCountry,
        updatedAt: serverTimestamp(),
      };

      if (!existingSnap.empty) {
        await withTimeout(updateDoc(existingSnap.docs[0].ref, estimateDoc));
      } else {
        await withTimeout(addDoc(estimatesRef, {
          ...estimateDoc,
          createdAt: serverTimestamp(),
        }));
      }

      await withTimeout(loadSelectedQuarterAndYear());
      if (mounted.current) {
        setLastSavedAt(Date.now());
      }
    } catch (error) {
      console.error('[useIncomeEstimator] saveEntry failed:', error);
      showThemedAlertSimple('Save Failed', getFriendlyFirestoreMessage(error));
    } finally {
      if (!mounted.current) return;
      setIsSaving(false);
    }
  }, [
    breakdown.totalOwed,
    form.deductions,
    form.grossIncome,
    loadSelectedQuarterAndYear,
    selectedCountry,
    selectedQuarter,
    selectedYear,
  ]);

  return {
    selectedQuarter,
    selectedYear,
    setQuarter,
    setYear,
    form,
    setForm,
    saveEntry,
    isSaving,
    breakdown,
    safeAmount,
    quarterSummaries,
    loading,
    lastSavedAt,
  };
}
