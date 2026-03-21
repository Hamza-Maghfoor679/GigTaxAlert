import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { s } from '@/theme';

type SkeletonProps = {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
};

/**
 * Skeleton
 *
 * Single pulsing placeholder block. Compose multiples to build
 * screen-level skeletons that match your actual layout.
 *
 * @example
 * <Skeleton width={s(140)} height={vs(18)} />
 * <Skeleton width="100%" height={vs(90)} style={{ borderRadius: s(12) }} />
 */
export function Skeleton({ width, height, borderRadius, style }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1,   { duration: 700 }),
      ),
      -1, // infinite
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? s(8),
          backgroundColor: 'rgba(128,128,128,0.15)',
        },
        animStyle,
        style,
      ]}
    />
  );
}