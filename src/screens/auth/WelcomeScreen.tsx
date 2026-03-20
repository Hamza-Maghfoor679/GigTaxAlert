import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import type { AuthStackParamList } from '@/navigation/types';
import { spacing, typography, useThemeColors } from '@/theme';

export type WelcomeScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Welcome'
>;

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    sub: {
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={[typography.displayMedium, { color: colors.textPrimary }]}>GigTaxAlert</Text>
      <Text style={[typography.bodyLarge, styles.sub]}>
        Deadlines, estimates, and reminders for freelancers.
      </Text>
      <Button
        label="Get started"
        onPress={() => navigation.navigate('LoginSignUp')}
      />
    </View>
  );
}
