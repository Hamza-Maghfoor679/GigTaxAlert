import { useCallback } from 'react';

import { useEstimatorStore } from '@/stores/estimatorStore';
import { estimateSelfEmploymentTax } from '@/utils/taxCalculators';

export function useIncomeEstimator() {
  const grossIncome = useEstimatorStore((s) => s.grossIncome);
  const estimatedTax = useEstimatorStore((s) => s.estimatedTax);
  const setGrossIncome = useEstimatorStore((s) => s.setGrossIncome);
  const setEstimatedTax = useEstimatorStore((s) => s.setEstimatedTax);

  const recalculate = useCallback(() => {
    setEstimatedTax(estimateSelfEmploymentTax(grossIncome));
  }, [grossIncome, setEstimatedTax]);

  return {
    grossIncome,
    estimatedTax,
    setGrossIncome,
    recalculate,
  };
}
