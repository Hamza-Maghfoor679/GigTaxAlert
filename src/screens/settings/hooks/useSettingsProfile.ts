import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

import type { FreelanceType, UserProfile } from '../types/settings.types';
import { getCountryLabel } from '../utils/settingsHelpers';

type UseSettingsProfileReturn = {
  profile:             UserProfile | null;
  loading:             boolean;
  isSaving:            boolean;
  error:               string | null;
  updateCountry:       (country: string) => Promise<void>;
  updateFreelanceType: (type: FreelanceType) => Promise<void>;
};

export function useSettingsProfile(): UseSettingsProfileReturn {
  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // const { data } = await supabase.from('profiles').select('*').single();
      await new Promise((r) => setTimeout(r, 400));
      setProfile({
        id: 'user-123', displayName: 'John Doe', email: 'john@example.com',
        country: 'US', countryLabel: 'United States', freelanceType: 'developer',
        subscriptionTier: 'pro', avatarInitials: 'JD',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // ✅ Defer fetch until all mount animations have finished
    const task = InteractionManager.runAfterInteractions(() => {
      void fetchProfile();
    });
    return () => task.cancel();
  }, [fetchProfile]);

  const updateCountry = useCallback(async (country: string) => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setProfile((prev) => prev ? { ...prev, country, countryLabel: getCountryLabel(country) } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update country');
    } finally {
      setIsSaving(false);
    }
  }, [profile]);

  const updateFreelanceType = useCallback(async (freelanceType: FreelanceType) => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setProfile((prev) => prev ? { ...prev, freelanceType } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update freelance type');
    } finally {
      setIsSaving(false);
    }
  }, [profile]);

  return { profile, loading, isSaving, error, updateCountry, updateFreelanceType };
}