import { useCallback } from 'react';
import { Alert, type StyleProp, View, type ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import type { CountryCode, FreelanceType } from '../types/settings.types';
import { SettingRow } from './Settingrow';

type Props = {
  country: CountryCode;
  countryLabel: string;
  freelanceType: FreelanceType;
  isSaving: boolean;
  sectionCardStyle: StyleProp<ViewStyle>;
  onCountryChange: (code: CountryCode) => Promise<void>;
  onFreelanceChange: (type: FreelanceType) => Promise<void>;
};

/**
 * ProfileSection
 *
 * Country picker + freelance type picker.
 * Uses ActionSheetIOS on iOS, Alert-based list on Android.
 * Saving country triggers deadline regeneration on the backend.
 */
export function ProfileSection({
  country, countryLabel, freelanceType,
  isSaving, sectionCardStyle,
  onCountryChange, onFreelanceChange,
}: Props) {
  const colors = useThemeColors();

  const openCountryPicker = useCallback(() => {
    Alert.alert('Country', 'Choose your country', [
      { text: 'United States', onPress: () => { void onCountryChange('US'); } },
      { text: 'United Kingdom', onPress: () => { void onCountryChange('UK'); } },
      { text: 'Germany', onPress: () => { void onCountryChange('DE'); } },
      { text: 'France', onPress: () => { void onCountryChange('FR'); } },
      { text: 'Netherlands', onPress: () => { void onCountryChange('NL'); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [onCountryChange]);

  const openFreelancePicker = useCallback(() => {
    Alert.alert('Freelance Type', 'Choose your freelance type', [
      { text: 'Developer', onPress: () => { void onFreelanceChange('developer'); } },
      { text: 'Designer', onPress: () => { void onFreelanceChange('designer'); } },
      { text: 'Writer', onPress: () => { void onFreelanceChange('writer'); } },
      { text: 'Consultant', onPress: () => { void onFreelanceChange('consultant'); } },
      { text: 'Creator', onPress: () => { void onFreelanceChange('creator'); } },
      { text: 'Other', onPress: () => { void onFreelanceChange('other'); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [onFreelanceChange]);

  const freelanceLabel = freelanceType.charAt(0).toUpperCase() + freelanceType.slice(1);

  return (
    <View style={sectionCardStyle}>
      <SettingRow
        type="pressable"
        emoji="🌍"
        iconBg={colors.primary + '20'}
        label="Country"
        subtitle="Used to calculate your tax deadlines"
        value={countryLabel || country}
        loading={isSaving}
        onPress={openCountryPicker}
        showDivider
      />
      <SettingRow
        type="pressable"
        emoji="💼"
        iconBg={colors.secondary + '20'}
        label="Freelance type"
        subtitle="Helps personalise your reminders"
        value={freelanceLabel}
        loading={isSaving}
        onPress={openFreelancePicker}
      />
    </View>
  );
}