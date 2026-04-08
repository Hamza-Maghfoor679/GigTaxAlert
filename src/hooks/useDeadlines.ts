import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';

import type { Deadline } from '@/components/ui/homeComponents/deadline.types';
import { useUserProfile } from '@/context/UserProfileContext';
import { generateDeadlines } from '@/utils/deadlineEngine';

type DeadlineStatusDoc = {
  isComplete?: boolean;
};

type UserDoc = {
  displayName?: string;
  country?: string;
  subscriptionTier?: 'free' | 'pro';
};

export function useDeadlines(): {
  deadlines: Deadline[];
  loading: boolean;
  refetch: () => Promise<void>;
  toggleComplete: (id: string) => void;
} {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const { setProfile, country: contextCountry } = useUserProfile();
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      if (!mounted.current) return;
      setDeadlines([]);
      if (!mounted.current) return;
      setLoading(false);
      return;
    }

    if (!mounted.current) return;
    setLoading(true);

    try {
      const db = getFirestore();
      const userRef = doc(collection(db, 'users'), uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() as UserDoc | undefined;
      const country = userData?.country ?? contextCountry ?? null;
      const displayName = userData?.displayName ?? null;
      const subscriptionTier = userData?.subscriptionTier ?? null;

      if (!mounted.current) return;
      setProfile({
        displayName,
        country,
        subscriptionTier,
      });

      if (!country) {
        if (!mounted.current) return;
        setDeadlines([]);
        if (!mounted.current) return;
        setLoading(false);
        return;
      }

      const currentYear = new Date().getFullYear();
      // TODO Phase 2: write currentYear to deadlinesGeneratedYear after generation
      const generated = generateDeadlines(country, currentYear);

      const statusSnap = await getDocs(collection(userRef, 'deadlineStatus'));

      const statusMap = new Map<string, boolean>();
      statusSnap.forEach((doc) => {
        const data = doc.data() as DeadlineStatusDoc;
        statusMap.set(doc.id, Boolean(data.isComplete));
      });

      const merged = generated.map((deadline) => ({
        ...deadline,
        isComplete: statusMap.get(deadline.id) ?? deadline.isComplete,
      }));

      if (!mounted.current) return;
      setDeadlines(merged);
    } catch (error) {
      const errorCode =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code?: unknown }).code === 'string'
          ? (error as { code: string }).code
          : '';

      if (errorCode === 'firestore/permission-denied' && contextCountry) {
        const currentYear = new Date().getFullYear();
        const fallbackDeadlines = generateDeadlines(contextCountry, currentYear);
        if (!mounted.current) return;
        setDeadlines(fallbackDeadlines);
        console.error(
          '[useDeadlines] permission denied for Firestore read, using local generated deadlines:',
          error,
        );
        return;
      }

      console.error('[useDeadlines] refetch failed:', error);
      if (!mounted.current) return;
      setDeadlines([]);
    } finally {
      if (!mounted.current) return;
      setLoading(false);
    }
  }, [contextCountry, setProfile]);

  const toggleComplete = useCallback((id: string) => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    let previousSnapshot: Deadline[] = [];
    let nextValue: boolean | null = null;

    if (!mounted.current) return;
    setDeadlines((prev) => {
      previousSnapshot = prev;
      const updated = prev.map((deadline) => {
        if (deadline.id !== id) return deadline;
        nextValue = !deadline.isComplete;
        return { ...deadline, isComplete: nextValue };
      });
      return updated;
    });

    if (nextValue === null) return;

    const persist = async () => {
      try {
        const db = getFirestore();
        const statusRef = doc(collection(doc(collection(db, 'users'), uid), 'deadlineStatus'), id);
        await setDoc(
          statusRef,
          {
            isComplete: nextValue,
            completedAt: nextValue ? serverTimestamp() : null,
          },
          { merge: true },
        );
      } catch (error) {
        console.error('[useDeadlines] toggleComplete failed:', error);
        if (!mounted.current) return;
        setDeadlines(previousSnapshot);
        Alert.alert(
          'Sync Failed',
          'Could not save changes. Check your connection and try again.',
        );
      }
    };

    void persist();
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { deadlines, loading, refetch, toggleComplete };
}
