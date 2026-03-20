import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { SettingsStackParamList } from '@/navigation/types';
import { spacing, typography, useThemeColors } from '@/theme';

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
    <View style={styles.container}>
      <Text style={typography.h1}>Profile</Text>
      <Card>
        <Text style={typography.bodyLarge}>Display name</Text>
        <Text style={[typography.bodySmall, styles.meta]}>
          Sync from Supabase `profiles` table.
        </Text>
      </Card>
    </View>
  );
}
