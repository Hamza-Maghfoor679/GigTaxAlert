import { useEffect, useState } from 'react';

import { TaxEstimate } from '@/components/ui/homeComponents/deadline.types';

type UseTaxEstimateReturn = {
  estimate: TaxEstimate | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * useTaxEstimate
 *
 * Fetches the user's latest quarterly income entry + their country's
 * tax rate from the profile to compute an estimated tax owed figure.
 *
 * Returns:
 * - `estimate`  → null for free users (isPro: false) or when no income data exists
 * - `loading`   → true during initial fetch
 * - `error`     → error message string if fetch fails
 * - `refetch`   → manually re-trigger the fetch (e.g. after new income entry)
 *
 * Data sources (wire to your Supabase client):
 * - `income_entries`  → latest quarter rows for the current user
 * - `profiles`        → tax_rate, is_pro flag, currency
 * - `deadline_rules`  → next quarterly deadline title + due date
 *
 * @example
 * const { estimate, loading } = useTaxEstimate();
 * <TaxEstimateWidget estimate={estimate} onPress={...} />
 */
export function useTaxEstimate(): UseTaxEstimateReturn {
  const [estimate, setEstimate] = useState<TaxEstimate | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchEstimate = async () => {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Fetch user profile (isPro flag, taxRate, currency) ──────────
      // const { data: profile } = await supabase
      //   .from('profiles')
      //   .select('is_pro, tax_rate, currency')
      //   .single();

      // ── 2. If not Pro → return locked estimate and bail early ──────────
      // if (!profile?.is_pro) {
      //   setEstimate({ amountDue: 0, currency: 'USD', dueDate: '', deadlineTitle: '', isPro: false });
      //   return;
      // }

      // ── 3. Fetch latest quarter's income entries ────────────────────────
      // const quarterStart = getQuarterStart(); // from your dateHelpers
      // const { data: incomeRows } = await supabase
      //   .from('income_entries')
      //   .select('amount')
      //   .gte('entry_date', quarterStart.toISOString());

      // ── 4. Sum income and apply tax rate ───────────────────────────────
      // const totalIncome = incomeRows?.reduce((sum, r) => sum + r.amount, 0) ?? 0;
      // const amountDue   = totalIncome * (profile.tax_rate / 100);

      // ── 5. Fetch next deadline for this quarter ────────────────────────
      // const { data: nextRule } = await supabase
      //   .from('deadline_rules')
      //   .select('name, due_date')
      //   .eq('category', 'quarterly')
      //   .gte('due_date', new Date().toISOString())
      //   .order('due_date', { ascending: true })
      //   .limit(1)
      //   .single();

      // ── TODO: replace mock below with the real queries above ───────────
      const mock: TaxEstimate = {
        amountDue:     1240,
        currency:      'USD',
        dueDate:       'Apr 15, 2025',
        deadlineTitle: 'Q1 Estimated Tax',
        isPro:         true,       // flip to false to test locked state
      };

      setEstimate(mock);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tax estimate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEstimate();
  }, []);

  return { estimate, loading, error, refetch: fetchEstimate };
}