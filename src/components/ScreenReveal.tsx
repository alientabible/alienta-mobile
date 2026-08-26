import { usePathname } from 'expo-router';
import { type PropsWithChildren, useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';

type ScreenRevealProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

/**
 * A non-directional transition: the screen settles into focus instead of
 * sliding from an arbitrary edge. It replays when its tab regains focus.
 */
export function ScreenReveal({ children, style }: ScreenRevealProps) {
  const reduceMotion = useReducedMotionPreference();
  const pathname = usePathname();
  const [progress] = useState(() => new Animated.Value(1));

  useEffect(() => {
    progress.stopAnimation();

    if (reduceMotion) {
      progress.setValue(1);
      return undefined;
    }

    progress.setValue(0);
    const reveal = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    reveal.start();

    return () => reveal.stop();
  }, [pathname, progress, reduceMotion]);

  const animatedStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.68, 1],
    }),
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.976, 1],
        }),
      },
    ],
  };

  return <Animated.View style={[styles.content, style, animatedStyle]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    width: '100%',
  },
});
