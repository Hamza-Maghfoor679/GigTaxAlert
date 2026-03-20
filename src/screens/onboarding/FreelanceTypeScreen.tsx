import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import type { OnboardingStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { spacing, typography, useThemeColors } from '@/theme';

export type FreelanceTypeScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'FreelanceType'
>;

export default function FreelanceTypeScreen(_props: FreelanceTypeScreenProps) {
  const setStatus = useAuthStore((s) => s.setStatus);
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
      gap: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sub: {
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={typography.h1}>What do you do?</Text>
      <Text style={[typography.bodyMedium, styles.sub]}>
        Capture freelance type to tailor reminders (placeholder).
      </Text>
      <Button label="Finish" onPress={() => setStatus('main')} />
    </View>
  );
}
