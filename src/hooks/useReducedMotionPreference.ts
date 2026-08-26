import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Keeps motion respectful of the operating-system accessibility preference
 * without depending on a native animation worklet runtime.
 */
export function useReducedMotionPreference() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) {
        setReduceMotion(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
