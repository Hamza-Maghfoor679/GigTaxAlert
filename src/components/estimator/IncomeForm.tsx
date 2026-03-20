import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing, typography, useThemeColors } from '@/theme';

type IncomeFormProps = {
  initialGross: number;
  onChangeGross: (value: number) => void;
};

export function IncomeForm({ initialGross, onChangeGross }: IncomeFormProps) {
  const colors = useThemeColors();
  const [text, setText] = useState(
    initialGross > 0 ? String(initialGross) : '',
  );

  const styles = StyleSheet.create({
    wrap: {
      gap: spacing.xs,
    },
    input: {
      ...typography.bodyLarge,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
  });

  return (
    <View style={styles.wrap}>
      <Text style={typography.labelLarge}>Gross income (YTD)</Text>
      <TextInput
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textDisabled}
        style={styles.input}
        value={text}
        onChangeText={(v) => {
          setText(v);
          const n = Number.parseFloat(v);
          onChangeGross(Number.isFinite(n) ? n : 0);
        }}
      />
    </View>
  );
}
