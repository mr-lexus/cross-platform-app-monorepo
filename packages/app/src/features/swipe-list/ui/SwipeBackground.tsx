import { StyleSheet, Text } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { colors } from '../../../shared/theme';

type SwipeBackgroundProps = {
  translateX: SharedValue<number>;
  threshold: number;
};

/**
 * Red delete layer behind the row, visible on BOTH swipe directions. Its
 * opacity follows the drag progress (0.5 -> 1.0 across the threshold),
 * mirroring the prototype's feedback — driven entirely from the shared
 * value, never from React state.
 */
export function SwipeBackground({ translateX, threshold }: SwipeBackgroundProps) {
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, threshold],
      [0.5, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View style={[styles.background, backgroundStyle]} pointerEvents="none">
      <Text style={styles.affordance}>Delete</Text>
      <Text style={styles.affordance}>Delete</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.delete,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  affordance: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
