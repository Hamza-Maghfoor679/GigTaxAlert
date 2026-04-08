import { getAuth } from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from '@react-native-firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CountryCode, FreelanceType, UserProfile } from '../types/settings.types';
import { COUNTRY_LABELS, getInitials } from '../utils/settingsHelpers';

type UseSettingsProfileReturn = {
  profile: UserProfile | null;
  loading: boolean;
  isSaving: boolean;
  updateCountry: (country: string) => void;
  updateFreelanceType: (type: string) => void;
};

export function useSettingsProfile(): UseSettingsProfileReturn {
  const [rawProfile, setRawProfile] = useState<{
    displayName: string;
    email: string;
    country: CountryCode;
    freelanceType: FreelanceType;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      setRawProfile(null);
      setLoading(false);
      return;
    }

    const firestore = getFirestore();
    const userRef = doc(collection(firestore, 'users'), uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists) {
          setRawProfile(null);
          setLoading(false);
          return;
        }
        const data = snapshot.data() as {
          displayName?: string;
          email?: string;
          country?: CountryCode;
          freelanceType?: FreelanceType;
        };
        setRawProfile({
          displayName: data.displayName ?? 'GigTax User',
          email: data.email ?? '',
          country: data.country ?? 'US',
          freelanceType: data.freelanceType ?? 'other',
        });
        setLoading(false);
      },
      (error) => {
        console.error('useSettingsProfile snapshot error:', error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const profile = useMemo<UserProfile | null>(() => {
    if (!rawProfile) return null;
    return {
      displayName: rawProfile.displayName,
      email: rawProfile.email,
      avatarInitials: getInitials(rawProfile.displayName),
      country: rawProfile.country,
      countryLabel: COUNTRY_LABELS[rawProfile.country],
      freelanceType: rawProfile.freelanceType,
    };
  }, [rawProfile]);

  const updateCountry = useCallback((country: string) => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    if (!rawProfile) return;
    const nextCountry = country as CountryCode;

    setRawProfile((prev) => (prev ? { ...prev, country: nextCountry } : prev));
    setIsSaving(true);

    const run = async () => {
      try {
        const firestore = getFirestore();
        const userRef = doc(collection(firestore, 'users'), uid);
        await updateDoc(userRef, {
          country: nextCountry,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('updateCountry error:', error);
      } finally {
        setIsSaving(false);
      }
    };
    void run();
  }, [rawProfile]);

  const updateFreelanceType = useCallback((freelanceType: string) => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    if (!rawProfile) return;
    const nextType = freelanceType as FreelanceType;

    setRawProfile((prev) => (prev ? { ...prev, freelanceType: nextType } : prev));
    setIsSaving(true);

    const run = async () => {
      try {
        const firestore = getFirestore();
        const userRef = doc(collection(firestore, 'users'), uid);
        await updateDoc(userRef, {
          freelanceType: nextType,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('updateFreelanceType error:', error);
      } finally {
        setIsSaving(false);
      }
    };
    void run();
  }, [rawProfile]);

  return { profile, loading, isSaving, updateCountry, updateFreelanceType };
}