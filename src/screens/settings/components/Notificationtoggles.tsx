import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import type { CategoryKey, NotificationPrefs } from '../types/settings.types';
import { SettingRow } from './Settingrow';

type Props = {
  prefs: NotificationPrefs;
  isSaving: boolean;
  sectionCardStyle: ViewStyle;
  onToggleGlobal: (value: boolean) => void;
  onToggleCategory: (key: CategoryKey, value: boolean) => void;
};

export function NotificationToggles({
  prefs, isSaving, sectionCardStyle,
  onToggleGlobal, onToggleCategory,
}: Props) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    dimmed: { opacity: 0.6 },
  });

  return (
    <View style={[sectionCardStyle, isSaving && styles.dimmed]} pointerEvents={isSaving ? 'none' : 'auto'}>
      <SettingRow
        type="toggle"
        emoji="🔔"
        iconBg={colors.primary + '20'}
        label="All Reminders"
        value={prefs.globalEnabled}
        onToggle={onToggleGlobal}
        showDivider
      />
      <SettingRow
        type="toggle"
        emoji="📅"
        iconBg={colors.warning + '20'}
        label="Quarterly Tax"
        value={prefs.categories.quarterly}
        disabled={!prefs.globalEnabled}
        onToggle={(value) => onToggleCategory('quarterly', value)}
        showDivider
      />
      <SettingRow
        type="toggle"
        emoji="💰"
        iconBg={colors.success + '20'}
        label="Income Tax"
        value={prefs.categories.income_tax}
        disabled={!prefs.globalEnabled}
        onToggle={(value) => onToggleCategory('income_tax', value)}
        showDivider
      />
      <SettingRow
        type="toggle"
        emoji="👤"
        iconBg={colors.primary + '20'}
        label="Self-Employment"
        value={prefs.categories.self_employment}
        disabled={!prefs.globalEnabled}
        onToggle={(value) => onToggleCategory('self_employment', value)}
        showDivider
      />
      <SettingRow
        type="toggle"
        emoji="🏦"
        iconBg={colors.danger + '20'}
        label="VAT"
        value={prefs.categories.vat}
        disabled={!prefs.globalEnabled}
        onToggle={(value) => onToggleCategory('vat', value)}
        showDivider
      />
      <SettingRow
        type="toggle"
        emoji="📋"
        iconBg={colors.border}
        label="1099 / Other"
        value={prefs.categories.other}
        disabled={!prefs.globalEnabled}
        onToggle={(value) => onToggleCategory('other', value)}
      />
    </View>
  );
}