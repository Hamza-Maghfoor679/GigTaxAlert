import { create } from 'zustand';

import type { AuthFlowStatus } from '@/navigation/types';

type AuthState = {
  status: AuthFlowStatus;
  setStatus: (status: AuthFlowStatus) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'auth',
  setStatus: (status) => set({ status }),
}));
