import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette, type SectionTone } from '@/theme/tokens';

type SectionHeaderProps = {
  description: string;
  eyebrow: string;
  icon: AppIconName;
  title: string;
  tone: SectionTone;
};

export function SectionHeader({ description, eyebrow, icon, title, tone }: SectionHeaderProps) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, tone);
  const reduceMotion = useReducedMotion();
  const breath = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      breath.value = 0;
      return undefined;
    }

    breath.value = withRepeat(
      withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );

    return () => cancelAnimation(breath);
  }, [breath, reduceMotion]);

  const orbStyle = useAnimatedStyle(() => ({
    opacity: 0.07 + breath.value * 0.05,
    transform: [{ scale: 1 + breath.value * 0.1 }],
  }));

  return (
    <View style={[styles.heroDepth, getPremiumDepth(theme, 'floating')]}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: palette.soft,
            borderColor: theme.colors.outline,
          },
        ]}
      >
        <View
          accessibilityElementsHidden
          style={[styles.orbLarge, { borderColor: palette.accent }]}
        />
        <Animated.View
          accessibilityElementsHidden
          style={[styles.orbSmall, { backgroundColor: palette.accent }, orbStyle]}
        />

        <View style={[styles.iconWell, { backgroundColor: palette.accent }]}>
          <AppIcon
            name={icon}
            size={24}
            tintColor={palette.onAccent}
            type="monochrome"
          />
        </View>
        <AppText style={[styles.eyebrow, { color: palette.accent }]} variant="eyebrow">
          {eyebrow}
        </AppText>
        <AppText accessibilityRole="header" style={styles.title} variant="hero">
          {title}
        </AppText>
        <View style={[styles.rule, { backgroundColor: palette.accent }]} />
        <AppText color="textMuted" style={styles.description}>
          {description}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroDepth: {
    borderRadius: 30,
  },
  hero: {
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 290,
    overflow: 'hidden',
    padding: 24,
  },
  orbLarge: {
    borderRadius: 95,
    borderWidth: 1,
    height: 190,
    opacity: 0.2,
    position: 'absolute',
    right: -55,
    top: -48,
    width: 190,
  },
  orbSmall: {
    borderRadius: 32,
    height: 64,
    opacity: 0.08,
    position: 'absolute',
    right: 44,
    top: 34,
    width: 64,
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginBottom: 24,
    width: 44,
  },
  eyebrow: {
    fontSize: 12,
  },
  title: {
    fontSize: 42,
    lineHeight: 46,
    marginTop: 8,
    maxWidth: 310,
  },
  rule: {
    borderRadius: 2,
    height: 2,
    marginTop: 18,
    width: 38,
  },
  description: {
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 310,
  },
});
