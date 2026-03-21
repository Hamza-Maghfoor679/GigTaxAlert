import React from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ScaleCardProps = {
  children: React.ReactNode;
  /** Extra styles applied to the Animated.View wrapper */
  style?: object;
  /** If omitted the card is non-interactive (no press feedback) */
  onPress?: () => void;
  /** Entrance delay in ms (default 0) */
  delay?: number;
  /** Spring scale target on press-in (default 0.95) */
  scaleTo?: number;
};

/**
 * ScaleCard
 *
 * Animated wrapper that combines:
 * - Short fade-in entrance (staggerable via `delay`)
 * - Light scale on press-in / press-out
 *
 * @example
 * <ScaleCard delay={120} onPress={handlePress}>
 *   <View style={styles.card}>...</View>
 * </ScaleCard>
 */
export function ScaleCard({
  children,
  style,
  onPress,
  delay = 0,
  scaleTo = 0.95,
}: ScaleCardProps) {
  const scale    = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const timing = { duration: 90, easing: Easing.out(Easing.quad) };
  const onPressIn  = () => { scale.value = withTiming(scaleTo, timing); };
  const onPressOut = () => { scale.value = withTiming(1, timing); };

  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(200)}
      style={[animStyle, style]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        disabled={!onPress}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}