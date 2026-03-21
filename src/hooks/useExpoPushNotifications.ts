import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// ─── Foreground notification behaviour ───────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

// ─── Android channel ──────────────────────────────────────────────────────────

const setupAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('deadlines', {
    name:             'Tax Deadlines',
    description:      'Upcoming tax deadline alerts',
    importance:       Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor:       '#2563EB',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd:        false,
  });
};

// ─── Token registration ───────────────────────────────────────────────────────

const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.warn('[Push] Physical device required — skipping token registration');
    return null;
  }

  await setupAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Permission not granted');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;

  if (!projectId) {
    console.warn('[Push] Missing EAS projectId in app.json extra.eas.projectId');
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return token;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

type UseExpoPushTokenReturn = {
  token:  string | null;
  status: Notifications.PermissionStatus | null;
  error:  string | null;
};

/**
 * useExpoPushToken
 *
 * Registers for push notifications on mount and returns the Expo push token.
 * Save this token to `profiles.expo_push_token` in Supabase so your
 * backend can send targeted push notifications.
 *
 * @example
 * const { token } = useExpoPushToken();
 *
 * useEffect(() => {
 *   if (token) {
 *     void supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId);
 *   }
 * }, [token]);
 */
export function useExpoPushToken(): UseExpoPushTokenReturn {
  const [token,  setToken]  = useState<string | null>(null);
  const [status, setStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotifications()
      .then((t) => {
        setToken(t);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to register for push notifications');
      });

    // Check permission status separately so it's always up to date
    Notifications.getPermissionsAsync()
      .then(({ status: s }) => setStatus(s))
      .catch(() => {});
  }, []);

  return { token, status, error };
}