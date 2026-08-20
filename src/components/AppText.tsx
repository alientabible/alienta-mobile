import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts, type AppColors } from '@/theme/tokens';

type TextVariant = 'body' | 'caption' | 'eyebrow' | 'heading' | 'hero' | 'serifBody';

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
    fontFamily: fonts.sansRegular,
    fontSize: 17,
    lineHeight: 26,
  },
  caption: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  eyebrow: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    letterSpacing: 1.4,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: fonts.serifSemibold,
    fontSize: 30,
    letterSpacing: -0.2,
    lineHeight: 36,
  },
  hero: {
    fontFamily: fonts.serifSemibold,
    fontSize: 44,
    letterSpacing: -0.7,
    lineHeight: 52,
  },
  serifBody: {
    fontFamily: fonts.serifMedium,
    fontSize: 21,
    lineHeight: 27,
  },
});
