import * as Haptics from 'expo-haptics';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { radius, s, spacing, typography, vs, useThemeColors } from '@/theme';
import { EstimatorFormState } from '../../types/estimator.types';

type Props = {
  form: EstimatorFormState;
  onChange: (partial: Partial<EstimatorFormState>) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  currency?: string;
};

type FieldProps = {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  prefix: string;
  delay: number;
};

function Field({ label, hint, value, onChange, prefix, delay }: FieldProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(18)} style={styles.fieldWrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.prefix}>{prefix}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textDisabled}
          returnKeyType="done"
        />
      </View>
    </Animated.View>
  );
}

export function IncomeForm({ form, onChange, onSave, isSaving, currency = '$' }: Props) {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      <Animated.Text entering={FadeInDown.springify().damping(18)} style={styles.sectionTitle}>
        Income and Deductions
      </Animated.Text>

      <Field
        label="Gross Income"
        hint="This quarter"
        value={form.grossIncome}
        onChange={(v) => onChange({ grossIncome: v })}
        prefix={currency}
        delay={60}
      />

      <Field
        label="Deductions"
        hint="Business expenses"
        value={form.deductions}
        onChange={(v) => onChange({ deductions: v })}
        prefix={currency}
        delay={120}
      />

      <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            void onSave();
          }}
          activeOpacity={0.85}
          disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnTxt}>Save Entry</Text>}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: vs(16),
    },
    sectionTitle: { ...typography.h3, color: colors.textPrimary },
    fieldWrapper: { gap: vs(6) },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    label: { ...typography.labelLarge, color: colors.textPrimary },
    hint: { ...typography.caption, color: colors.textSecondary },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: s(14),
      height: vs(52),
      gap: s(8),
    },
    prefix: { ...typography.bodyLarge, color: colors.textSecondary },
    input: { ...typography.bodyLarge, color: colors.textPrimary, flex: 1 },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      height: vs(50),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: s(8),
    },
    saveBtnTxt: { ...typography.labelLarge, color: '#FFF', fontSize: s(15) },
    saveBtnDisabled: { opacity: 0.6 },
  });
