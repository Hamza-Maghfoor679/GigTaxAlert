import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import type { SettingsStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { spacing, typography, useThemeColors, useThemeMode } from '@/theme';

export type SettingsScreenProps = NativeStackScreenProps<
  SettingsStackParamList,
  'Settings'
>;

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const setStatus = useAuthStore((s) => s.setStatus);
  const colors = useThemeColors();
  const { isDark, setThemeMode, themeMode } = useThemeMode();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
      gap: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={typography.h1}>Settings</Text>
      <Button
        label="Subscription"
        onPress={() => navigation.navigate('Subscription')}
        variant="secondary"
      />
      <Button
        label="Profile"
        onPress={() => navigation.navigate('Profile')}
        variant="ghost"
      />
      <Button label="Log out (demo)" onPress={() => setStatus('auth')} />
      <Button
        label={themeMode === 'system' ? 'System theme' : 'Use system theme'}
        onPress={() => setThemeMode('system')}
        variant="ghost"
      />
      <Button
        label={isDark ? 'Switch to Light' : 'Switch to Dark'}
        onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
        variant="secondary"
      />
    </View>
  );
}
