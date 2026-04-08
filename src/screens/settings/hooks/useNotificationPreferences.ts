import { useCallback, useEffect, useState } from 'react';
import { getAuth } from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';

import type { CategoryKey, NotificationPrefs } from '../types/settings.types';

const DEFAULT_PREFS: NotificationPrefs = {
  globalEnabled: true,
  categories: {
    quarterly: true,
    income_tax: true,
    self_employment: true,
    vat: true,
    other: true,
  },
};

type UseNotificationPreferencesReturn = {
  prefs: NotificationPrefs;
  isSaving: boolean;
  toggleGlobal: (value: boolean) => void;
  toggleCategory: (category: CategoryKey, value: boolean) => void;
};

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const firestore = getFirestore();
    const prefsRef = doc(collection(doc(collection(firestore, 'users'), uid), 'notificationPrefs'), 'settings');
    const unsubscribe = onSnapshot(
      prefsRef,
      (snapshot) => {
        if (!snapshot.exists) {
          setPrefs(DEFAULT_PREFS);
          return;
        }
        const data = snapshot.data() as Partial<NotificationPrefs>;
        setPrefs({
          globalEnabled: data.globalEnabled ?? true,
          categories: {
            quarterly: data.categories?.quarterly ?? true,
            income_tax: data.categories?.income_tax ?? true,
            self_employment: data.categories?.self_employment ?? true,
            vat: data.categories?.vat ?? true,
            other: data.categories?.other ?? true,
          },
        });
      },
      (error) => {
        console.error('notificationPrefs snapshot error:', error);
      },
    );
    return unsubscribe;
  }, []);

  const persist = useCallback((nextPrefs: NotificationPrefs) => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    setPrefs(nextPrefs);
    setIsSaving(true);

    const run = async () => {
      try {
        const firestore = getFirestore();
        const prefsRef = doc(collection(doc(collection(firestore, 'users'), uid), 'notificationPrefs'), 'settings');
        await setDoc(
          prefsRef,
          {
            ...nextPrefs,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (error) {
        console.error('notificationPrefs persist error:', error);
      } finally {
        setIsSaving(false);
      }
    };
    void run();
  }, []);

  const toggleGlobal = useCallback((value: boolean) => {
    persist({
      ...prefs,
      globalEnabled: value,
    });
  }, [persist, prefs]);

  const toggleCategory = useCallback((category: CategoryKey, value: boolean) => {
    persist({
      ...prefs,
      categories: {
        ...prefs.categories,
        [category]: value,
      },
    });
  }, [persist, prefs]);

  return { prefs, isSaving, toggleGlobal, toggleCategory };
}