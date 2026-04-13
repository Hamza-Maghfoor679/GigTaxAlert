import { getAuth } from '@react-native-firebase/auth';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { NavigationContainerRef } from '@react-navigation/native';

import { useUserProfile } from '@/context/UserProfileContext';
import { registerNotificationHandlers } from '@/utils/notificationHandlers';
import { scheduleAllNotifications } from '@/utils/notificationScheduler';
import { setupNotifications } from '@/utils/notificationSetup';
import { useAuthStore } from '@/stores/authStore';

import type { MainTabParamList } from './types';

type Props = {
  navigationRef: NavigationContainerRef<MainTabParamList>;
};

export function NotificationOrchestrator({ navigationRef }: Props) {
  const status = useAuthStore((s) => s.status);
  const uid = getAuth().currentUser?.uid ?? null;
  const { deadlines } = useUserProfile();

  const setupDoneForUid = useRef<string | null>(null);

  useEffect(() => {
    const cleanup = registerNotificationHandlers(navigationRef);
    return () => cleanup();
    // navigationRef is stable (createNavigationContainerRef in RootNavigator module scope).
  }, []);

  useEffect(() => {
    if (status !== 'main' || !uid) {
      if (status !== 'main') {
        setupDoneForUid.current = null;
      }
      return;
    }
    if (setupDoneForUid.current === uid) return;
    setupDoneForUid.current = uid;
    void setupNotifications(uid);
  }, [status, uid]);

  useEffect(() => {
    if (status !== 'main' || !uid || deadlines.length === 0) return;
    void scheduleAllNotifications(deadlines);
  }, [status, uid, deadlines]);

  useEffect(() => {
    const onChange = (nextState: AppStateStatus) => {
      if (nextState !== 'active') return;
      const activeUid = getAuth().currentUser?.uid;
      if (!activeUid || deadlines.length === 0) return;
      void scheduleAllNotifications(deadlines);
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [deadlines]);

  return null;
}
