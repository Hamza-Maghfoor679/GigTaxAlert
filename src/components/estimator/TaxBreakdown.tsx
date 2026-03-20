import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useThemeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatters';

import { Card } from '../ui/Card';

type TaxBreakdownProps = {
  grossIncome: number;
  estimatedTax: number;
};

export function TaxBreakdown({ grossIncome, estimatedTax }: TaxBreakdownProps) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    disclaimer: {
      marginTop: spacing.md,
      color: colors.textSecondary,
    },
  });

  return (
    <Card>
      <Text style={[typography.h3, { color: colors.textPrimary }]}>Estimate</Text>
      <View style={styles.row}>
        <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>Gross</Text>
        <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>{formatCurrency(grossIncome)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>Est. SE tax (placeholder)</Text>
        <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>{formatCurrency(estimatedTax)}</Text>
      </View>
      <Text style={[typography.caption, styles.disclaimer, { color: colors.textSecondary }]}>
        Not tax advice — replace with jurisdiction-specific logic.
      </Text>
    </Card>
  );
}
