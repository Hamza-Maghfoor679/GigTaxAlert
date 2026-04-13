import type { NavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import type { MainTabParamList } from '@/navigation/types';

function hasDeadlineId(data: Record<string, unknown> | undefined): data is { deadlineId: string } {
  return typeof data?.deadlineId === 'string';
}

export function registerNotificationHandlers(
  navigation: NavigationContainerRef<MainTabParamList>,
): () => void {
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log(
      '[notification] received in foreground:',
      notification.request.content.title,
    );
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const raw = response.notification.request.content.data;
    const data =
      raw && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : undefined;

    if (!hasDeadlineId(data)) return;

    if (navigation.isReady()) {
      navigation.navigate('Dashboard', { screen: 'Home' });
    }
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
