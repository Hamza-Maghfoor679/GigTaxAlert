import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getFirestore,
  getDoc,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import * as Notifications from 'expo-notifications';

import { useUserProfile } from '@/context/UserProfileContext';
import { generateDeadlines } from '@/utils/deadlineEngine';
import { scheduleAllNotifications } from '@/utils/notificationScheduler';
import type { HookDeadline } from '@/hooks/types/deadline.types';
import type { DeadlineCategory } from '@/components/ui/homeComponents/deadline.types';

import type { CountryCode, NotificationPreferences } from '../types/settings.types';
import { showThemedAlertSimple } from '@/services/themedAlert';

const DEFAULT_PREFS: NotificationPreferences = {
  globalEnabled: true,
  deadlines: true,
  dayOf: true,
  postDeadline: true,
};

type UseNotificationPreferencesReturn = {
  prefs: NotificationPreferences;
  isSaving: boolean;
  toggleGlobal: () => Promise<void>;
  toggleCategory: (
    key: keyof Omit<NotificationPreferences, 'globalEnabled'>,
    value: boolean,
  ) => Promise<void>;
};

function toHookDeadlines(country: CountryCode): HookDeadline[] {
  return generateDeadlines(country, new Date().getFullYear()).map((deadline) => ({
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
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const mounted = useRef(true);
  const [uid, setUid] = useState<string | null>(getAuth().currentUser?.uid ?? null);
  const { deadlines, country } = useUserProfile();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (user) => {
      if (!mounted.current) return;
      setUid(user?.uid ?? null);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!uid) return;

    const run = async () => {
      try {
        const prefsRef = doc(collection(doc(collection(getFirestore(), 'users'), uid), 'settings'), 'notifications');
        const snapshot = await getDoc(prefsRef);
        if (!mounted.current) return;
        if (!snapshot.exists) {
          setPrefs(DEFAULT_PREFS);
          return;
        }
        const data = snapshot.data() as Partial<NotificationPreferences>;
        setPrefs({
          globalEnabled: data.globalEnabled ?? true,
          deadlines: data.deadlines ?? true,
          dayOf: data.dayOf ?? true,
          postDeadline: data.postDeadline ?? true,
        });
      } catch (error) {
        console.error('[useNotificationPreferences] load failed:', error);
      }
    };
    void run();
  }, [uid]);

  const toggleGlobal = useCallback(async (): Promise<void> => {
    if (!uid) return;
    const nextPrefs: NotificationPreferences = {
      ...prefs,
      globalEnabled: !prefs.globalEnabled,
    };
    const prev = prefs;
    setPrefs(nextPrefs);
    setIsSaving(true);
    try {
      const prefsRef = doc(collection(doc(collection(getFirestore(), 'users'), uid), 'settings'), 'notifications');
      await setDoc(
        prefsRef,
        {
          ...nextPrefs,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      if (!nextPrefs.globalEnabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('[notificationPrefs] all notifications cancelled');
      } else {
        const deadlinesToSchedule =
          deadlines.length > 0
            ? deadlines
            : toHookDeadlines((country as CountryCode | null) ?? 'US');
        await scheduleAllNotifications(deadlinesToSchedule, nextPrefs);
      }
    } catch (error) {
      if (mounted.current) setPrefs(prev);
      showThemedAlertSimple('Failed', 'Could not update notification settings.');
      console.error('[useNotificationPreferences] toggleGlobal failed:', error);
    } finally {
      if (mounted.current) setIsSaving(false);
    }
  }, [country, deadlines, prefs, uid]);

  const toggleCategory = useCallback(async (
    key: keyof Omit<NotificationPreferences, 'globalEnabled'>,
    value: boolean,
  ): Promise<void> => {
    const nextPrefs: NotificationPreferences = {
      ...prefs,
      [key]: value,
    };
    if (!uid) return;
    const prev = prefs;
    setPrefs(nextPrefs);
    setIsSaving(true);
    try {
      const prefsRef = doc(collection(doc(collection(getFirestore(), 'users'), uid), 'settings'), 'notifications');
      await setDoc(
        prefsRef,
        {
          ...nextPrefs,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      const deadlinesToSchedule =
        deadlines.length > 0
          ? deadlines
          : toHookDeadlines((country as CountryCode | null) ?? 'US');
      await scheduleAllNotifications(deadlinesToSchedule, nextPrefs);
    } catch (error) {
      if (mounted.current) setPrefs(prev);
      showThemedAlertSimple('Failed', 'Could not update notification settings.');
      console.error('[useNotificationPreferences] toggleCategory failed:', error);
    } finally {
      if (mounted.current) setIsSaving(false);
    }
  }, [country, deadlines, prefs, uid]);

  return { prefs, isSaving, toggleGlobal, toggleCategory };
}