import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import type { AppColors } from '@/theme/tokens';

type TextVariant = 'body' | 'caption' | 'eyebrow' | 'heading' | 'hero';

type AppTextProps = PropsWithChildren<
  TextProps & {
    color?: keyof AppColors;
    variant?: TextVariant;
  }
>;

export function AppText({
  children,
  color = 'text',
  style,
  variant = 'body',
  ...props
}: AppTextProps) {
  const theme = useAppTheme();

  return (
    <Text
      allowFontScaling
      style={[styles[variant], { color: theme.colors[color] }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 17,
    lineHeight: 26,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 31,
  },
  hero: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 46,
  },
});
