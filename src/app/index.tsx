import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { RootNavigator } from '@/navigation/RootNavigator';
import { ThemeProvider, useThemeMode } from '@/theme';

function ThemedStatusBar() {
  const { isDark } = useThemeMode();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      await SplashScreen.preventAutoHideAsync();
      setReady(true);
    };

    void prepare();
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const id = setTimeout(() => {
      void SplashScreen.hideAsync();
    }, 0);

    return () => {
      clearTimeout(id);
    };
  }, [ready]);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <RootNavigator />
        <ThemedStatusBar />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
