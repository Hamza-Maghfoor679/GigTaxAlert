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
    if (!fontsLoaded && !fontError) return;
    void SplashScreen.hideAsync();
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <PushTokenRegistrar />
          <RootNavigator />
          <ThemedStatusBar />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}