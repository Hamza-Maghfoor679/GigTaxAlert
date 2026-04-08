import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type UserProfile = {
  displayName: string | null;
  country: string | null;
  subscriptionTier: 'free' | 'pro' | null;
};

type UserProfileContextValue = UserProfile & {
  setProfile: (p: Partial<UserProfile>) => void;
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>({
    displayName: null,
    country: null,
    subscriptionTier: null,
  });

  const setProfile = useCallback((p: Partial<UserProfile>) => {
    setProfileState((prev) => ({ ...prev, ...p }));
  }, []);

  const value = useMemo<UserProfileContextValue>(
    () => ({
      ...profile,
      setProfile,
    }),
    [profile, setProfile],
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
