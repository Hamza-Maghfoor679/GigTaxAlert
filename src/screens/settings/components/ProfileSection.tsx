import { useCallback, type ViewStyle } from 'react';
import { Alert, View } from 'react-native';

import { useThemeColors } from '@/theme';
import { COUNTRY_LABELS, COUNTRY_OPTIONS, FREELANCE_OPTIONS } from '../utils/settingsHelpers';
import { SettingRow } from './Settingrow';

type Props = {
  country: string;
  countryLabel: string;
  freelanceType: string;
  isSaving: boolean;
  sectionCardStyle: ViewStyle;
  onCountryChange: (code: string) => void;
  onFreelanceChange: (type: string) => void;
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
    Alert.alert('Country', 'Select your tax country', [
      ...COUNTRY_OPTIONS.map((option) => ({
        text: `${option.flag} ${COUNTRY_LABELS[option.code]}`,
        onPress: () => onCountryChange(option.code),
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [onCountryChange]);

  const openFreelancePicker = useCallback(() => {
    Alert.alert('Freelance Type', 'Select your work type', [
      ...FREELANCE_OPTIONS.map((option) => ({
        text: option.label,
        onPress: () => onFreelanceChange(option.value),
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [onFreelanceChange]);

  const selectedFreelance = FREELANCE_OPTIONS.find((option) => option.value === freelanceType);

  return (
    <View style={sectionCardStyle}>
      <SettingRow
        type="pressable"
        emoji="🌍"
        iconBg={colors.primary + '20'}
        label="Country"
        value={countryLabel || country}
        loading={isSaving}
        onPress={openCountryPicker}
        showDivider
      />
      <SettingRow
        type="pressable"
        emoji="💼"
        iconBg={colors.warning + '20'}
        label="Freelance Type"
        value={selectedFreelance?.label ?? freelanceType}
        loading={isSaving}
        onPress={openFreelancePicker}
      />
    </View>
  );
}