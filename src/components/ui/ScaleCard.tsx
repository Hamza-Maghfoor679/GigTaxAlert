import React from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type ScaleCardProps = {
  children: React.ReactNode;
  /** Extra styles applied to the Animated.View wrapper */
  style?: object;
  /** If omitted the card is non-interactive (no press feedback) */
  onPress?: () => void;
  /** FadeInDown entrance delay in ms (default 0) */
  delay?: number;
  /** Spring scale target on press-in (default 0.95) */
  scaleTo?: number;
};

/**
 * ScaleCard
 *
 * Animated wrapper that combines:
 * - FadeInDown spring entrance (staggerable via `delay`)
 * - Spring scale-down on press-in / scale-back on press-out
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

  const onPressIn  = () => { scale.value = withSpring(scaleTo, { damping: 15 }); };
  const onPressOut = () => { scale.value = withSpring(1,       { damping: 15 }); };

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(18)}
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