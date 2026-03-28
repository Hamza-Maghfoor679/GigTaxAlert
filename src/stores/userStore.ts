// stores/userStore.ts
import { create } from 'zustand';
import { listenUser, updateFcmToken } from '@/services/user';
import { UserDoc } from '@/types/schemas/user';

interface UserState {
  user:           UserDoc | null;
  isLoading:      boolean;
  startListening: (uid: string) => () => void; // returns unsubscribe fn
  saveFcmToken:   (uid: string, token: string) => Promise<void>;
  clear:          () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user:      null,
  isLoading: true,

  // Call this in App.tsx once Firebase Auth confirms a session exists.
  // Store the returned unsubscribe fn and call it in useEffect cleanup.
  startListening: (uid) => {
    return listenUser(uid, (user) => set({ user, isLoading: false }));
  },

  saveFcmToken: async (uid, token) => {
    await updateFcmToken(uid, token);
    // Firestore listener auto-updates the store — no manual set() needed
  },

  // Call on sign-out to wipe the store
  clear: () => set({ user: null, isLoading: true }),
}));