import { create } from 'zustand';

import type { AuthFlowStatus } from '@/navigation/types';

type AuthState = {
  status: AuthFlowStatus;
  isBootstrapping: boolean;
  setStatus: (status: AuthFlowStatus) => void;
  setBootstrapping: (isBootstrapping: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'auth',
  isBootstrapping: true,
  setStatus: (status) => set({ status }),
  setBootstrapping: (isBootstrapping) => set({ isBootstrapping }),
}));
