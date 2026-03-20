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
      <Text style={typography.h3}>Estimate</Text>
      <View style={styles.row}>
        <Text style={typography.bodyMedium}>Gross</Text>
        <Text style={typography.bodyMedium}>{formatCurrency(grossIncome)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={typography.bodyMedium}>Est. SE tax (placeholder)</Text>
        <Text style={typography.bodyMedium}>{formatCurrency(estimatedTax)}</Text>
      </View>
      <Text style={[typography.caption, styles.disclaimer]}>
        Not tax advice — replace with jurisdiction-specific logic.
      </Text>
    </Card>
  );
}
