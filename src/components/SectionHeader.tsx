import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts, getSectionPalette, type SectionTone } from '@/theme/tokens';

type SectionHeaderProps = {
  description: string;
  eyebrow: string;
  icon: SymbolViewProps['name'];
  title: string;
  tone: SectionTone;
};

export function SectionHeader({ description, eyebrow, icon, title, tone }: SectionHeaderProps) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, tone);

  return (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: palette.soft,
          borderColor: theme.colors.outline,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <View
        accessibilityElementsHidden
        style={[styles.orbLarge, { borderColor: palette.accent }]}
      />
      <View accessibilityElementsHidden style={[styles.orbSmall, { backgroundColor: palette.accent }]} />

      <View style={[styles.iconWell, { backgroundColor: palette.accent }]}>
        <SymbolView
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
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    minHeight: 290,
    overflow: 'hidden',
    padding: 24,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
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
