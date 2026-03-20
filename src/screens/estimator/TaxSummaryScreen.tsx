import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { TaxBreakdown } from '@/components/estimator/TaxBreakdown';
import type { EstimatorStackParamList } from '@/navigation/types';
import { useEstimatorStore } from '@/stores/estimatorStore';
import { spacing, typography, useThemeColors } from '@/theme';

export type TaxSummaryScreenProps = NativeStackScreenProps<
  EstimatorStackParamList,
  'TaxSummary'
>;

export default function TaxSummaryScreen(_props: TaxSummaryScreenProps) {
  const grossIncome = useEstimatorStore((s) => s.grossIncome);
  const estimatedTax = useEstimatorStore((s) => s.estimatedTax);
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
      <Text style={typography.h2}>Tax summary</Text>
      <TaxBreakdown grossIncome={grossIncome} estimatedTax={estimatedTax} />
    </View>
  );
}
