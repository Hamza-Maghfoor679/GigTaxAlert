import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { updateFcmToken } from '@/services/user';

export async function setupNotifications(uid: string): Promise<void> {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[notificationSetup] permission not granted, skipping FCM registration');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('deadlines', {
        name: 'Tax Deadlines',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const fcmToken = await getToken(getMessaging(getApp()));
    await updateFcmToken(uid, fcmToken);
    console.log('[notificationSetup] FCM token saved:', fcmToken);
  } catch (error) {
    console.error('[notificationSetup] failed:', error);
  }
}
