import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {  StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { SettingsStackParamList } from '@/navigation/types';
import { spacing, typography, useThemeColors } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ProfileScreenProps = NativeStackScreenProps<
  SettingsStackParamList,
  'Profile'
>;

export default function ProfileScreen(_props: ProfileScreenProps) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
      gap: spacing.md,
    },
    meta: {
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center' }]}>Profile</Text>
      <Card>
        <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>Display name</Text>
        <Text style={[typography.bodySmall, styles.meta, { color: colors.textSecondary }]}>
          Sync from Supabase `profiles` table.
        </Text>
      </Card>
    </SafeAreaView>
  );
}
