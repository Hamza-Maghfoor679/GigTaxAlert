import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, getAuth } from '@react-native-firebase/auth';
import { collection, doc, getFirestore, onSnapshot } from '@react-native-firebase/firestore';

import type { DeadlineError, HookDeadline } from '@/hooks/types/deadline.types';
import { useUserDeadlineSync } from '@/hooks/useUserDeadlineSync';
import type { FreelanceType } from '@/screens/settings/types/settings.types';

export type UserProfile = {
  displayName: string | null;
  country: string | null;
  subscriptionTier: 'free' | 'pro' | null;
  freelanceType: FreelanceType | null;
};

type UserProfileContextValue = UserProfile & {
  setProfile: (p: Partial<UserProfile>) => void;
  deadlines: HookDeadline[];
  deadlinesLoading: boolean;
  deadlinesError: DeadlineError | null;
  refetchDeadlines: () => Promise<void>;
  toggleDeadlineComplete: (id: string) => Promise<void>;
  activeDeadlines: HookDeadline[];
  completedDeadlines: HookDeadline[];
  upcomingDeadlines: HookDeadline[];
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>({
    displayName: null,
    country: null,
    subscriptionTier: null,
    freelanceType: null,
  });

  const setProfile = useCallback((p: Partial<UserProfile>) => {
    setProfileState((prev) => ({ ...prev, ...p }));
  }, []);

  const deadlineSync = useUserDeadlineSync();

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeUser?.();
      unsubscribeUser = null;

      if (!user?.uid) {
        setProfileState((prev) => ({
          ...prev,
          displayName: null,
          country: null,
          subscriptionTier: null,
          freelanceType: null,
        }));
        return;
      }

      const userRef = doc(collection(getFirestore(), 'users'), user.uid);
      unsubscribeUser = onSnapshot(
        userRef,
        (snap) => {
          if (!snap.exists) return;
          const data = snap.data() as {
            displayName?: string | null;
            country?: string | null;
            subscriptionTier?: 'free' | 'pro' | null;
            freelanceType?: FreelanceType | null;
          };
          setProfileState((prev) => ({
            ...prev,
            displayName: data.displayName ?? prev.displayName,
            country: data.country ?? prev.country,
            subscriptionTier: data.subscriptionTier ?? prev.subscriptionTier,
            freelanceType: data.freelanceType ?? prev.freelanceType,
          }));
        },
        (error) => {
          console.error('[UserProfileContext] user snapshot error:', error);
        },
      );
    });

    return () => {
      unsubscribeUser?.();
      unsubscribeAuth();
    };
  }, []);

  const value = useMemo<UserProfileContextValue>(
    () => ({
      ...profile,
      setProfile,
      deadlines: deadlineSync.deadlines,
      deadlinesLoading: deadlineSync.loading,
      deadlinesError: deadlineSync.error,
      refetchDeadlines: deadlineSync.refetch,
      toggleDeadlineComplete: deadlineSync.toggleComplete,
      activeDeadlines: deadlineSync.activeDeadlines,
      completedDeadlines: deadlineSync.completedDeadlines,
      upcomingDeadlines: deadlineSync.upcomingDeadlines,
    }),
    [profile, setProfile, deadlineSync],
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile(): UserProfileContextValue {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return context;
}
