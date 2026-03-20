import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { spacing, typography, useThemeColors } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeadlineCalendarScreen() {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
      gap: spacing.md,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.h1, { color: colors.textPrimary }]}>Calendar</Text>
      <Card>
        <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>
          Month view + marked dates — integrate `react-native-calendars` or
          similar.
        </Text>
      </Card>
    </SafeAreaView>
  );
}
