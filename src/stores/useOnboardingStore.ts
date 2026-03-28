// stores/onboardingStore.ts
import { CountryCode, FreelanceType } from '@/types/schemas/user';
import { create } from 'zustand';

interface OnboardingState {
  country:          CountryCode | null;
  freelanceType:    FreelanceType | null;
  setCountry:       (country: CountryCode) => void;
  setFreelanceType: (type: FreelanceType) => void;
  clear:            () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  country:          null,
  freelanceType:    null,
  setCountry:       (country)       => set({ country }),
  setFreelanceType: (freelanceType) => set({ freelanceType }),
  clear:            () => set({ country: null, freelanceType: null }),
}));