import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { radius, s, spacing, typography, useThemeColors, vs } from '@/theme';
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
  const [modalType, setModalType] = useState<'country' | 'freelance' | null>(null);

  const openCountryPicker = useCallback(() => {
    setModalType('country');
  }, []);

  const openFreelancePicker = useCallback(() => {
    setModalType('freelance');
  }, []);

  const countryOptions = useMemo(
    () => [
      { label: 'United States', value: 'US' as CountryCode },
      { label: 'United Kingdom', value: 'UK' as CountryCode },
      { label: 'Germany', value: 'DE' as CountryCode },
      { label: 'France', value: 'FR' as CountryCode },
      { label: 'Netherlands', value: 'NL' as CountryCode },
    ],
    [],
  );

  const freelanceOptions = useMemo(
    () => [
      { label: 'Developer', value: 'developer' as FreelanceType },
      { label: 'Designer', value: 'designer' as FreelanceType },
      { label: 'Writer', value: 'writer' as FreelanceType },
      { label: 'Consultant', value: 'consultant' as FreelanceType },
      { label: 'Creator', value: 'creator' as FreelanceType },
      { label: 'Other', value: 'other' as FreelanceType },
    ],
    [],
  );

  const closeModal = useCallback(() => {
    setModalType(null);
  }, []);

  const onSelectCountry = useCallback(
    async (code: CountryCode) => {
      closeModal();
      await onCountryChange(code);
    },
    [closeModal, onCountryChange],
  );

  const onSelectFreelance = useCallback(
    async (type: FreelanceType) => {
      closeModal();
      await onFreelanceChange(type);
    },
    [closeModal, onFreelanceChange],
  );

  const freelanceLabel = freelanceType.charAt(0).toUpperCase() + freelanceType.slice(1);
  const isCountryModal = modalType === 'country';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modalBackdrop: {
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          justifyContent: 'flex-end',
        },
        sheet: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
          gap: spacing.sm,
        },
        handle: {
          width: s(44),
          height: vs(5),
          borderRadius: radius.full,
          backgroundColor: colors.border,
          alignSelf: 'center',
          marginBottom: vs(6),
        },
        modalTitle: {
          ...typography.h3,
          color: colors.textPrimary,
        },
        modalSubtitle: {
          ...typography.bodySmall,
          color: colors.textSecondary,
          marginTop: vs(2),
          marginBottom: vs(8),
        },
        optionList: {
          borderRadius: radius.lg,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        },
        optionButton: {
          paddingHorizontal: spacing.md,
          paddingVertical: vs(13),
          backgroundColor: colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        optionButtonActive: {
          backgroundColor: colors.primaryLight,
        },
        optionText: {
          ...typography.bodyMedium,
          color: colors.textPrimary,
        },
        optionTextActive: {
          color: colors.primary,
          fontFamily: 'Inter_600SemiBold',
        },
        optionCheck: {
          ...typography.bodyMedium,
          color: colors.primary,
          fontFamily: 'Inter_700Bold',
        },
        optionDivider: {
          height: 1,
          backgroundColor: colors.border,
        },
        cancelButton: {
          marginTop: vs(6),
          paddingHorizontal: spacing.md,
          paddingVertical: vs(13),
          borderRadius: radius.lg,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
        },
        cancelText: {
          ...typography.bodyMedium,
          color: colors.textSecondary,
          fontFamily: 'Inter_600SemiBold',
        },
      }),
    [colors],
  );

  return (
    <>
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

      <Modal visible={modalType !== null} transparent animationType="slide" onRequestClose={closeModal}>
        <Pressable style={styles.modalBackdrop} onPress={closeModal}>
          <Pressable onPress={() => {}} style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>{isCountryModal ? 'Choose country' : 'Choose freelance type'}</Text>
            <Text style={styles.modalSubtitle}>
              {isCountryModal
                ? 'This keeps your tax deadline calculations accurate.'
                : 'This helps tailor reminder messaging to your work style.'}
            </Text>

            <View style={styles.optionList}>
              {(isCountryModal ? countryOptions : freelanceOptions).map((option, idx, list) => {
                const selected = isCountryModal ? option.value === country : option.value === freelanceType;
                return (
                  <View key={option.value}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        if (isCountryModal) {
                          void onSelectCountry(option.value as CountryCode);
                          return;
                        }
                        void onSelectFreelance(option.value as FreelanceType);
                      }}
                      style={[styles.optionButton, selected && styles.optionButtonActive]}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextActive]}>{option.label}</Text>
                      {selected ? <Text style={styles.optionCheck}>✓</Text> : null}
                    </TouchableOpacity>
                    {idx < list.length - 1 ? <View style={styles.optionDivider} /> : null}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={closeModal} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}