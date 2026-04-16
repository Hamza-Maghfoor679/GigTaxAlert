import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from '@react-native-firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { DeadlineCategory } from '@/components/ui/homeComponents/deadline.types';
import type { HookDeadline } from '@/hooks/types/deadline.types';
import { useUserProfile } from '@/context/UserProfileContext';
import { generateDeadlines } from '@/utils/deadlineEngine';
import { scheduleAllNotifications } from '@/utils/notificationScheduler';

import type { CountryCode, FreelanceType, SettingsProfile } from '../types/settings.types';
import { COUNTRY_LABELS } from '../types/settings.types';
import { showThemedAlertSimple } from '@/services/themedAlert';

type UseSettingsProfileReturn = {
  profile: SettingsProfile | null;
  loading: boolean;
  isSaving: boolean;
  updateCountry: (code: CountryCode) => Promise<void>;
  updateFreelanceType: (type: FreelanceType) => Promise<void>;
};

export function useSettingsProfile(): UseSettingsProfileReturn {
  const { displayName, country, freelanceType, setProfile } = useUserProfile();
  const mounted = useRef(true);
  const [uid, setUid] = useState<string | null>(getAuth().currentUser?.uid ?? null);
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (!mounted.current) return;
      setUid(user?.uid ?? null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    if (displayName && country) {
      setLoading(false);
    }
  }, [displayName, country]);

  useEffect(() => {
    if (!uid) {
      if (!mounted.current) return;
      setEmail('');
      setPhotoURL(null);
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        const snap = await getDoc(doc(collection(getFirestore(), 'users'), uid));
        if (!mounted.current) return;
        if (snap.exists) {
          const data = snap.data() as { email?: string; photoURL?: string | null };
          setEmail(data.email ?? '');
          setPhotoURL(data.photoURL ?? null);
        }
      } catch (error) {
        console.error('[useSettingsProfile] user fetch failed:', error);
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    void run();
  }, [uid]);

  const profile = useMemo<SettingsProfile | null>(() => {
    if (!displayName && !uid) return null;
    const name = (displayName ?? '').trim();
    const normalizedCountry = (country as CountryCode | null) ?? 'US';
    const normalizedFreelanceType = freelanceType ?? 'other';
    const parts = name.split(/\s+/).filter(Boolean);
    let avatarInitials = '?';
    if (parts.length === 1) avatarInitials = parts[0]!.slice(0, 2).toUpperCase();
    if (parts.length >= 2) avatarInitials = `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    return {
      displayName: name || 'GigTax User',
      email,
      avatarInitials,
      country: normalizedCountry,
      countryLabel: COUNTRY_LABELS[normalizedCountry],
      freelanceType: normalizedFreelanceType,
      photoURL,
    };
  }, [country, displayName, email, freelanceType, photoURL, uid]);

  const toHookDeadlines = useCallback((code: CountryCode): HookDeadline[] => {
    return generateDeadlines(code, new Date().getFullYear()).map((deadline) => ({
      id: deadline.id,
      title: deadline.title,
      dueDate: deadline.dueDate instanceof Date ? deadline.dueDate : new Date(deadline.dueDate),
      isComplete: Boolean(deadline.isComplete ?? deadline.completed ?? false),
      daysLeft: deadline.daysLeft,
      category: (deadline.category ?? 'other') as DeadlineCategory,
      type: deadline.type,
      description: deadline.description,
      penaltyInfo: deadline.penaltyInfo,
      paymentUrl: deadline.paymentUrl,
      completed: deadline.completed,
    }));
  }, []);

  const updateCountry = useCallback(async (code: CountryCode): Promise<void> => {
    if (!uid) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(collection(getFirestore(), 'users'), uid), {
        country: code,
        updatedAt: serverTimestamp(),
      });
      setProfile({ country: code });
      const newDeadlines = toHookDeadlines(code);
      void scheduleAllNotifications(newDeadlines);
    } catch (error) {
      showThemedAlertSimple('Update Failed', 'Could not save country.');
      console.error('[useSettingsProfile] updateCountry failed:', error);
    } finally {
      if (mounted.current) setIsSaving(false);
    }
  }, [setProfile, toHookDeadlines, uid]);

  const updateFreelanceType = useCallback(async (type: FreelanceType): Promise<void> => {
    if (!uid) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(collection(getFirestore(), 'users'), uid), {
        freelanceType: type,
        updatedAt: serverTimestamp(),
      });
      setProfile({ freelanceType: type });
    } catch (error) {
      showThemedAlertSimple('Update Failed', 'Could not save freelance type.');
      console.error('[useSettingsProfile] updateFreelanceType failed:', error);
    } finally {
      if (mounted.current) setIsSaving(false);
    }
  }, [setProfile, uid]);

  return { profile, loading, isSaving, updateCountry, updateFreelanceType };
}