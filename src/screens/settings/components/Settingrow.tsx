import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Switch } from 'react-native';

import { s, vs, useThemeColors } from '@/theme';

type BaseProps = {
  label:       string;
  subtitle?:   string;
  emoji:       string;
  iconBg:      string;
  showDivider?: boolean;
};

type PressableRow = BaseProps & {
  type:     'pressable';
  value?:   string;
  onPress:  () => void;
};

type ToggleRow = BaseProps & {
  type:    'toggle';
  enabled: boolean;
  onToggle: () => void;
};

export type SettingRowProps = PressableRow | ToggleRow;

/**
 * SettingRow
 *
 * Polymorphic settings row — either a pressable nav row or a toggle switch.
 * Driven by the `type` prop so the parent never has to manage both variants.
 */
export function SettingRow(props: SettingRowProps) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    row: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: s(16),
      paddingVertical:   vs(13),
      gap:               s(12),
    },
    divider:    { height: 1, backgroundColor: colors.border, marginLeft: s(64) },
    iconBox:    { width: s(36), height: s(36), borderRadius: s(10), alignItems: 'center', justifyContent: 'center' },
    iconTxt:    { fontSize: s(18) },
    content:    { flex: 1, gap: vs(2) },
    label:      { fontSize: s(14), fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter_600SemiBold' },
    subtitle:   { fontSize: s(10), color: colors.textSecondary, fontFamily: 'Inter_400Regular' },
    value:      { fontSize: s(13), color: colors.textSecondary, fontFamily: 'Inter_400Regular' },
    chevron:    { fontSize: s(20), color: colors.textDisabled, lineHeight: s(24) },
  });

  const content = (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: props.iconBg }]}>
        <Text style={styles.iconTxt}>{props.emoji}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{props.label}</Text>
        {props.subtitle && <Text style={styles.subtitle}>{props.subtitle}</Text>}
        {props.type === 'pressable' && props.value && (
          <Text style={styles.value}>{props.value}</Text>
        )}
      </View>
      {props.type === 'toggle' ? (
        <Switch
          value={props.enabled}
          onValueChange={props.onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={'#FFF'}
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </View>
  );

  return (
    <>
      {props.type === 'pressable' ? (
        <TouchableOpacity onPress={props.onPress} activeOpacity={0.7}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
      {props.showDivider && <View style={styles.divider} />}
    </>
  );
}