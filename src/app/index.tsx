import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';

import { RootNavigator } from '@/navigation/RootNavigator';
import { ThemeProvider, useThemeMode } from '@/theme';
import { useExpoPushToken } from '@/hooks/useExpoPushNotifications';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { UserProfileProvider } from '@/context/UserProfileContext';
import { getAuth } from '@react-native-firebase/auth';
import { useAuthStore } from '@/stores/authStore';
import { clearAuthToken, getAuthToken, setAuthToken } from '@/services/authToken';
import { setUnauthorizedHandler } from '@/services/apiClient';

// Web client ID from Firebase (type 3) — must match google-services.json oauth_client
const GOOGLE_WEB_CLIENT_ID =
  '97946692169-jv5kb4v2scgjakh94hh4m5rv65j5ii66.apps.googleusercontent.com';

// ─── Themed status bar ────────────────────────────────────────────────────────

function ThemedStatusBar() {
  const { isDark } = useThemeMode();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

// ─── Push token registrar (side-effect only, renders nothing) ─────────────────

function PushTokenRegistrar() {
  const { token, error } = useExpoPushToken();

  useEffect(() => {
    if (!token) return;
    // TODO: save to Supabase after auth is wired up
    // void supabase
    //   .from('profiles')
    //   .update({ expo_push_token: token })
    //   .eq('id', currentUserId);
    console.log('[Push] Token registered:', token);
  }, [token]);

  useEffect(() => {
    if (error) console.warn('[Push] Registration error:', error);
  }, [error]);

  return null;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    void SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['email', 'profile'],
    });
  }, []);

  const setStatus = useAuthStore((s) => s.setStatus);
  const setBootstrapping = useAuthStore((s) => s.setBootstrapping);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          setStatus('auth');
          return;
        }

        const currentUser = getAuth().currentUser;
        if (!currentUser) {
          await clearAuthToken();
          setStatus('auth');
          return;
        }

        // Refresh token on launch so interceptors always use a current token.
        const freshToken = await currentUser.getIdToken(true);
        await setAuthToken(freshToken);
        setStatus('main');
      } catch (error) {
        console.warn('[Auth] Bootstrap failed:', error);
        await clearAuthToken();
        setStatus('auth');
      } finally {
        setBootstrapping(false);
      }
    };

    void bootstrapAuth();
  }, [setBootstrapping, setStatus]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setStatus('auth');
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [setStatus]);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    void SplashScreen.hideAsync();
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;
  if (isBootstrapping) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProfileProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <PushTokenRegistrar />
            <RootNavigator />
            <ThemedStatusBar />
          </SafeAreaProvider>
        </ThemeProvider>
      </UserProfileProvider>
    </GestureHandlerRootView>
  );
}