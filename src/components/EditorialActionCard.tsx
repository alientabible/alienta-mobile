import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette, type SectionTone } from '@/theme/tokens';

type EditorialActionCardProps = {
  description: string;
  icon: AppIconName;
  meta?: string;
  onPress?: () => void;
  title: string;
  tone: SectionTone;
};

export function EditorialActionCard({
  description,
  icon,
  meta,
  onPress,
  title,
  tone,
}: EditorialActionCardProps) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, tone);

  return (
    <Pressable
      accessibilityLabel={onPress ? title : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.outline,
        },
        getPremiumDepth(theme, 'raised'),
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={[styles.iconWell, { backgroundColor: palette.soft }]}>
        <AppIcon name={icon} size={23} tintColor={palette.accent} type="monochrome" />
      </View>
      <View style={styles.copy}>
        {meta ? (
          <AppText style={[styles.meta, { color: palette.accent }]} variant="eyebrow">
            {meta}
          </AppText>
        ) : null}
        <AppText style={styles.title} variant="serifBody">
          {title}
        </AppText>
        <AppText color="textMuted" style={styles.description} variant="caption">
          {description}
        </AppText>
      </View>
      <AppIcon
        name={{ android: 'arrow_forward', ios: 'arrow.right' }}
        size={18}
        tintColor={theme.colors.textMuted}
        type="monochrome"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 112,
    padding: 15,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 22,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  copy: {
    flex: 1,
    marginHorizontal: 14,
  },
  meta: {
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.serifSemibold,
    fontSize: 23,
    lineHeight: 27,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
});
