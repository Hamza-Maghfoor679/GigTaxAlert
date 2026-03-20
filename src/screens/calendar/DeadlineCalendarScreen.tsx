import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { spacing, typography, useThemeColors } from '@/theme';

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
    <View style={styles.container}>
      <Text style={typography.h1}>Calendar</Text>
      <Card>
        <Text style={typography.bodyMedium}>
          Month view + marked dates — integrate `react-native-calendars` or
          similar.
        </Text>
      </Card>
    </View>
  );
}
