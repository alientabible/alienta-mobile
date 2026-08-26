import { usePathname } from 'expo-router';
import { type PropsWithChildren, useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ScreenRevealProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

/**
 * A non-directional transition: the screen settles into focus instead of
 * sliding from an arbitrary edge. It replays when its tab regains focus.
 */
export function ScreenReveal({ children, style }: ScreenRevealProps) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const progress = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return undefined;
    }

    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });

    return () => cancelAnimation(progress);
  }, [pathname, progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.68, 1]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.976, 1]) }],
  }));

  return <Animated.View style={[styles.content, style, animatedStyle]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    width: '100%',
  },
});
