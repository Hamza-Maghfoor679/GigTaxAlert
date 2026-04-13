import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import type { NotificationPreferences } from '../types/settings.types';
import { SettingRow } from './Settingrow';

type Props = {
  prefs: NotificationPreferences;
  isSaving: boolean;
  sectionCardStyle: StyleProp<ViewStyle>;
  onToggleGlobal: () => Promise<void>;
  onToggleCategory: (
    key: keyof Omit<NotificationPreferences, 'globalEnabled'>,
    value: boolean,
  ) => Promise<void>;
};

export function NotificationToggles({
  prefs, isSaving, sectionCardStyle,
  onToggleGlobal, onToggleCategory,
}: Props) {
  const colors = useThemeColors();

  return (
    <View style={sectionCardStyle}>
      <SettingRow
        type="toggle"
        emoji="🔔"
        iconBg={colors.warning + '20'}
        label="All notifications"
        subtitle="Enable or disable all alerts"
        value={prefs.globalEnabled}
        disabled={isSaving}
        onToggle={() => { void onToggleGlobal(); }}
        showDivider
      />
      <SettingRow
        type="toggle"
        emoji="📅"
        iconBg={colors.primary + '20'}
        label="Deadline reminders"
        subtitle="30, 7, and 1 day before due date"
        value={prefs.deadlines}
        disabled={!prefs.globalEnabled || isSaving}
        onToggle={(value) => { void onToggleCategory('deadlines', value); }}
        showDivider
      />
      <SettingRow
        type="toggle"
        emoji="⚡"
        iconBg={colors.danger + '20'}
        label="Day-of alerts"
        subtitle="Morning reminder on the deadline day"
        value={prefs.dayOf}
        disabled={!prefs.globalEnabled || isSaving}
        onToggle={(value) => { void onToggleCategory('dayOf', value); }}
        showDivider
      />
      <SettingRow
        type="toggle"
        emoji="✅"
        iconBg={colors.secondary + '20'}
        label="Follow-up reminders"
        subtitle="Check-in 2 days after each deadline"
        value={prefs.postDeadline}
        disabled={!prefs.globalEnabled || isSaving}
        onToggle={(value) => { void onToggleCategory('postDeadline', value); }}
      />
    </View>
  );
}