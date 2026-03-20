import { create } from 'zustand';

type EstimatorState = {
  grossIncome: number;
  estimatedTax: number;
  setGrossIncome: (value: number) => void;
  setEstimatedTax: (value: number) => void;
};

export const useEstimatorStore = create<EstimatorState>((set) => ({
  grossIncome: 0,
  estimatedTax: 0,
  setGrossIncome: (grossIncome) => set({ grossIncome }),
  setEstimatedTax: (estimatedTax) => set({ estimatedTax }),
}));
