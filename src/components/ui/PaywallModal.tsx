import { Modal, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useThemeColors } from '@/theme';

import { Button } from './Button';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
};

export function PaywallModal({
  visible,
  onClose,
  onSubscribe,
}: PaywallModalProps) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(17, 24, 39, 0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      gap: spacing.sm,
    },
    body: {
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
  });

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={typography.h2}>Go Pro</Text>
          <Text style={[typography.bodyMedium, styles.body]}>
            Unlock PDF export and advanced reminders.
          </Text>
          <Button label="Subscribe" onPress={onSubscribe} />
          <Button label="Not now" onPress={onClose} variant="ghost" />
        </View>
      </View>
    </Modal>
  );
}
