import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { s, vs, useThemeColors } from '@/theme';
import type { NotificationCategory, NotificationPreferences } from '../types/settings.types';
import { NOTIFICATION_META } from '../utils/settingsHelpers';
import { SettingRow } from './Settingrow';

type Props = {
  prefs:           NotificationPreferences;
  isSaving:        boolean;
  sectionCardStyle: object;
  delay?:           number;
  onToggleGlobal:  () => Promise<void>;
  onToggleCategory:(category: NotificationCategory) => Promise<void>;
};

const CATEGORIES: NotificationCategory[] = [
  'estimated_tax',
  'vat',
  'self_assessment',
  'quarterly',
  'reminders',
];

const ICON_COLORS = [
  '#DBEAFE', // blue
  '#D1FAE5', // green
  '#FEF3C7', // amber
  '#EDE9FE', // purple
  '#FEE2E2', // red
];

/**
 * NotificationToggles
 *
 * Global master toggle + per-category toggles.
 * Category rows are disabled (greyed out) when global is off.
 */
export function NotificationToggles({
  prefs, isSaving, sectionCardStyle, delay = 0,
  onToggleGlobal, onToggleCategory,
}: Props) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    disabledOverlay: {
      opacity: 0.45,
    },
    savingTxt: {
      fontSize:    s(11),
      color:       colors.textSecondary,
      textAlign:   'center',
      paddingVertical: vs(6),
      fontFamily:  'Inter_400Regular',
    },
  });

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(200)}>
      {/* Global master toggle */}
      <View style={sectionCardStyle}>
        <SettingRow
          type="toggle"
          emoji="🔔"
          iconBg={colors.primaryLight}
          label="Push Notifications"
          subtitle="Master switch for all deadline alerts"
          enabled={prefs.globalEnabled}
          onToggle={() => void onToggleGlobal()}
        />
      </View>

      {/* Per-category toggles */}
      <View style={[sectionCardStyle, !prefs.globalEnabled && styles.disabledOverlay]}>
        {CATEGORIES.map((cat, i) => {
          const meta = NOTIFICATION_META[cat];
          return (
            <SettingRow
              key={cat}
              type="toggle"
              emoji={meta.emoji}
              iconBg={ICON_COLORS[i % ICON_COLORS.length]!}
              label={meta.label}
              subtitle={meta.description}
              enabled={prefs[cat] && prefs.globalEnabled}
              onToggle={() => {
                if (!prefs.globalEnabled) return;
                void onToggleCategory(cat);
              }}
              showDivider={i < CATEGORIES.length - 1}
            />
          );
        })}
        {isSaving && <Text style={styles.savingTxt}>Saving…</Text>}
      </View>
    </Animated.View>
  );
}