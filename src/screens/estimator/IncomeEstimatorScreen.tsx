import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { IncomeForm } from '@/components/estimator/IncomeForm';
import { TaxBreakdown } from '@/components/estimator/TaxBreakdown';
import { Button } from '@/components/ui/Button';
import type { EstimatorStackParamList } from '@/navigation/types';
import { useIncomeEstimator } from '@/hooks/useIncomeEstimator';
import { spacing, typography, useThemeColors } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export type IncomeEstimatorScreenProps = NativeStackScreenProps<
  EstimatorStackParamList,
  'IncomeEstimator'
>;

export default function IncomeEstimatorScreen({
  navigation,
}: IncomeEstimatorScreenProps) {
  const { grossIncome, estimatedTax, setGrossIncome, recalculate } =
    useIncomeEstimator();
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
      <Text style={[typography.h1, { color: colors.textPrimary }]}>Income estimator</Text>
      <IncomeForm initialGross={grossIncome} onChangeGross={setGrossIncome} />
      <Button label="Recalculate" onPress={recalculate} variant="secondary" />
      <TaxBreakdown grossIncome={grossIncome} estimatedTax={estimatedTax} />
      <Button
        label="View summary"
        onPress={() => navigation.navigate('TaxSummary')}
        variant="secondary"
      />
    </SafeAreaView>
  );
}
