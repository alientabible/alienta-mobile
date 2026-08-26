import { Platform, type ViewStyle } from 'react-native';

import type { AppTheme } from '@/theme/tokens';

export type DepthLevel = 'soft' | 'raised' | 'floating';

const depth = {
  soft: { blur: 16, elevation: 2, opacity: 0.08, spread: -7, y: 6 },
  raised: { blur: 28, elevation: 5, opacity: 0.13, spread: -9, y: 12 },
  floating: { blur: 38, elevation: 8, opacity: 0.18, spread: -10, y: 17 },
} as const;

export function getPremiumDepth(theme: AppTheme, level: DepthLevel = 'raised'): ViewStyle {
  const value = depth[level];
  const opacity = theme.isDark ? Math.min(value.opacity + 0.08, 0.32) : value.opacity;
  const shadow = theme.isDark
    ? `rgba(0, 0, 0, ${opacity})`
    : `rgba(16, 39, 31, ${opacity})`;
  const highlight = theme.isDark
    ? 'rgba(255, 255, 255, 0.045)'
    : 'rgba(255, 255, 255, 0.78)';

  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${value.y}px ${value.blur}px ${value.spread}px ${shadow}, inset 0px 1px 0px ${highlight}`,
    };
  }

  if (Platform.OS === 'android') {
    return {
      elevation: value.elevation,
      shadowColor: theme.colors.shadow,
    };
  }

  return {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: value.y },
    shadowOpacity: opacity,
    shadowRadius: value.blur / 2,
  };
}
