import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import type { AuthStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { spacing, typography, useThemeColors } from '@/theme';

export type LoginSignUpScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'LoginSignUp'
>;

export default function LoginSignUpScreen(_props: LoginSignUpScreenProps) {
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
    hint: {
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={typography.h1}>Sign in</Text>
      <Text style={[typography.bodyMedium, styles.hint]}>
        Wire Supabase Auth here. For now, continue to onboarding.
      </Text>
      <Button label="Continue" onPress={() => setStatus('onboarding')} />
    </View>
  );
}
