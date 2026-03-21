import * as Haptics from 'expo-haptics';
import { ActionSheetIOS, Alert, Platform, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { s, useThemeColors } from '@/theme';
import type { FreelanceType } from '../types/settings.types';
import {
  COUNTRY_OPTIONS,
  FREELANCE_OPTIONS,
  getCountryFlag,
} from '../utils/settingsHelpers';
import { SettingRow } from './Settingrow';

type Props = {
  country:          string;
  countryLabel:     string;
  freelanceType:    FreelanceType;
  isSaving:         boolean;
  sectionCardStyle: object;
  delay?:           number;
  onCountryChange:  (country: string) => Promise<void>;
  onFreelanceChange:(type: FreelanceType) => Promise<void>;
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
  isSaving, sectionCardStyle, delay = 0,
  onCountryChange, onFreelanceChange,
}: Props) {
  const colors = useThemeColors();

  const openCountryPicker = () => {
    const options = COUNTRY_OPTIONS.map((c) => `${c.flag}  ${c.label}`);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...options, 'Cancel'], cancelButtonIndex: options.length, title: 'Select Country' },
        (idx) => {
          if (idx < options.length) {
            void onCountryChange(COUNTRY_OPTIONS[idx]!.value);
          }
        },
      );
    } else {
      // Android: simple Alert-based picker
      // Replace with @react-native-picker/picker or a modal for production
      Alert.alert('Select Country', '', [
        ...COUNTRY_OPTIONS.map((c) => ({
          text: `${c.flag}  ${c.label}`,
          onPress: () => void onCountryChange(c.value),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const openFreelancePicker = () => {

    const options = FREELANCE_OPTIONS.map((f) => `${f.flag}  ${f.label}`);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...options, 'Cancel'], cancelButtonIndex: options.length, title: 'Freelance Type' },
        (idx) => {
          if (idx < options.length) {
            void onFreelanceChange(FREELANCE_OPTIONS[idx]!.value as FreelanceType);
          }
        },
      );
    } else {
      Alert.alert('Freelance Type', '', [
        ...FREELANCE_OPTIONS.map((f) => ({
          text: `${f.flag}  ${f.label}`,
          onPress: () => void onFreelanceChange(f.value as FreelanceType),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const freelanceMeta = FREELANCE_OPTIONS.find((f) => f.value === freelanceType);

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(200)}>
      <View style={sectionCardStyle}>
        <SettingRow
          type="pressable"
          emoji={getCountryFlag(country)}
          iconBg={colors.primaryLight}
          label="Country"
          subtitle={isSaving ? 'Updating deadlines…' : 'Regenerates your tax deadlines'}
          value={countryLabel}
          onPress={openCountryPicker}
          showDivider
        />
        <SettingRow
          type="pressable"
          emoji={freelanceMeta?.flag ?? '⚡'}
          iconBg={colors.secondary + '20'}
          label="Freelance Type"
          subtitle="Used to personalise your deadlines"
          value={freelanceMeta?.label ?? freelanceType}
          onPress={openFreelancePicker}
        />
      </View>
    </Animated.View>
  );
}