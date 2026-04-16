import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { radius, s, spacing, typography, useThemeColors, vs } from '@/theme';
import {
  type ThemedAlertButton,
  type ThemedAlertPayload,
  setThemedAlertPresenter,
} from '@/services/themedAlert';

type Props = {
  children: ReactNode;
};

const DEFAULT_BUTTON: ThemedAlertButton = { text: 'OK', style: 'default' };

export function ThemedAlertProvider({ children }: Props) {
  const colors = useThemeColors();
  const [payload, setPayload] = useState<ThemedAlertPayload | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setThemedAlertPresenter((nextPayload) => {
      setPayload({
        ...nextPayload,
        buttons: nextPayload.buttons?.length ? nextPayload.buttons : [DEFAULT_BUTTON],
      });
    });

    return () => {
      setThemedAlertPresenter(null);
    };
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    setPayload(null);
    setClosing(false);
  }, []);

  const onPressButton = useCallback(
    (button: ThemedAlertButton) => {
      close();
      void button.onPress?.();
    },
    [close],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
        },
        card: {
          width: '100%',
          maxWidth: s(380),
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          gap: spacing.sm,
        },
        title: {
          ...typography.h3,
          color: colors.textPrimary,
          textAlign: 'center',
        },
        message: {
          ...typography.bodyMedium,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: vs(4),
        },
        row: {
          flexDirection: 'row',
          gap: spacing.sm,
          marginTop: vs(4),
        },
        button: {
          flex: 1,
          borderRadius: radius.lg,
          paddingVertical: vs(12),
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
        },
        buttonDefault: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        buttonCancel: {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        buttonDestructive: {
          backgroundColor: colors.danger,
          borderColor: colors.danger,
        },
        buttonText: {
          ...typography.labelLarge,
          fontFamily: 'Inter_600SemiBold',
        },
        buttonTextOnSolid: {
          color: '#FFFFFF',
        },
        buttonTextOnMuted: {
          color: colors.textPrimary,
        },
      }),
    [colors],
  );

  const buttons = payload?.buttons ?? [DEFAULT_BUTTON];

  return (
    <>
      {children}
      <Modal transparent animationType="fade" visible={Boolean(payload) && !closing} onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Text style={styles.title}>{payload?.title}</Text>
            {payload?.message ? <Text style={styles.message}>{payload.message}</Text> : null}
            <View style={styles.row}>
              {buttons.map((button) => {
                const isCancel = button.style === 'cancel';
                const isDestructive = button.style === 'destructive';
                const isSolid = !isCancel;
                return (
                  <TouchableOpacity
                    key={button.text}
                    activeOpacity={0.85}
                    style={[
                      styles.button,
                      isCancel
                        ? styles.buttonCancel
                        : isDestructive
                          ? styles.buttonDestructive
                          : styles.buttonDefault,
                    ]}
                    onPress={() => onPressButton(button)}
                  >
                    <Text style={[styles.buttonText, isSolid ? styles.buttonTextOnSolid : styles.buttonTextOnMuted]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
