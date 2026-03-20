import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { DashboardStackParamList } from '@/navigation/types';
import { spacing, typography, useThemeColors } from '@/theme';

export type DeadlineDetailScreenProps = NativeStackScreenProps<
  DashboardStackParamList,
  'DeadlineDetail'
>;

export default function DeadlineDetailScreen({
  route,
}: DeadlineDetailScreenProps) {
  const { deadlineId } = route.params;
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
      marginTop: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={typography.h2}>Deadline</Text>
      <Card>
        <Text style={typography.bodyLarge}>ID: {deadlineId}</Text>
        <Text style={[typography.bodyMedium, styles.meta]}>
          Load full record from Supabase by id.
        </Text>
      </Card>
    </View>
  );
}
