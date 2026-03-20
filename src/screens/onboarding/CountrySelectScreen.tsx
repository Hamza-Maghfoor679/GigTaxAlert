import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import type { OnboardingStackParamList } from '@/navigation/types';
import { spacing, typography, useThemeColors } from '@/theme';

export type CountrySelectScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'CountrySelect'
>;

export default function CountrySelectScreen({
  navigation,
}: CountrySelectScreenProps) {
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
      <Text style={typography.h1}>Where do you file?</Text>
      <Text style={[typography.bodyMedium, styles.sub]}>
        Select country to load deadline rules (US, UK, DE, FR, NL).
      </Text>
      <Button
        label="Next"
        onPress={() => navigation.navigate('FreelanceType')}
      />
    </View>
  );
}
