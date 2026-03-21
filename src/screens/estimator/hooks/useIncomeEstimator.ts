import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  EstimatorFormState,
  IncomeEntry,
  Quarter,
  QuarterSummary,
} from '../types/estimator.types';
import { calcTaxBreakdown, safeToSpend } from '../utils/taxCalculator';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

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
  setForm: (f: Partial<EstimatorFormState>) => void;
  saveEntry: () => Promise<void>;
  isSaving: boolean;
  breakdown: ReturnType<typeof calcTaxBreakdown>;
  safeAmount: number;
  quarterSummaries: QuarterSummary[];
  loading: boolean;
  error: string | null;
};

export function useIncomeEstimator(): UseIncomeEstimatorReturn {
  const year = new Date().getFullYear();
  const [selectedQuarter, setQuarter] = useState<Quarter>(currentQuarter());
  const [selectedYear, setYear] = useState<number>(year);
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setFormState] = useState<EstimatorFormState>({
    grossIncome: '',
    deductions: '',
  });

  useEffect(() => {
    const entry = entries.find(
      (e) => e.quarter === selectedQuarter && e.year === selectedYear,
    );
    setFormState({
      grossIncome: entry ? String(entry.grossIncome) : '',
      deductions: entry ? String(entry.deductions) : '',
    });
  }, [selectedQuarter, selectedYear, entries]);

  const setForm = useCallback((partial: Partial<EstimatorFormState>) => {
    setFormState((prev) => ({ ...prev, ...partial }));
  }, []);

  const breakdown = useMemo(
    () => calcTaxBreakdown(form.grossIncome, form.deductions),
    [form.grossIncome, form.deductions],
  );

  const safeAmount = useMemo(
    () => safeToSpend(breakdown.grossIncome, breakdown.totalOwed),
    [breakdown.grossIncome, breakdown.totalOwed],
  );

  const quarterSummaries: QuarterSummary[] = useMemo(
    () =>
      QUARTERS.map((q) => {
        const entry = entries.find((e) => e.quarter === q && e.year === selectedYear);
        if (!entry) return { quarter: q, grossIncome: 0, estimatedTax: 0, hasData: false };

        const { totalOwed } = calcTaxBreakdown(
          String(entry.grossIncome),
          String(entry.deductions),
        );
        return {
          quarter: q,
          grossIncome: entry.grossIncome,
          estimatedTax: totalOwed,
          hasData: true,
        };
      }),
    [entries, selectedYear],
  );

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setEntries([
        {
          id: '1',
          quarter: 'Q1',
          year: selectedYear,
          grossIncome: 8500,
          deductions: 1200,
          savedAt: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const saveEntry = useCallback(async () => {
    setIsSaving(true);
    try {
      const gross = parseFloat(form.grossIncome) || 0;
      const deduct = parseFloat(form.deductions) || 0;
      await new Promise((r) => setTimeout(r, 500));

      setEntries((prev) => {
        const filtered = prev.filter(
          (e) => !(e.quarter === selectedQuarter && e.year === selectedYear),
        );
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            quarter: selectedQuarter,
            year: selectedYear,
            grossIncome: gross,
            deductions: deduct,
            savedAt: new Date().toISOString(),
          },
        ];
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  }, [form, selectedQuarter, selectedYear]);

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
    error,
  };
}
