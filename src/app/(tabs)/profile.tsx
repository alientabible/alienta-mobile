import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { BrandLockup } from '@/components/BrandLockup';
import { PreviewNotice } from '@/components/PreviewNotice';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ThemeQuickToggle } from '@/components/ThemeQuickToggle';
import { type ThemeMode, useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

type ThemeOption = {
  icon: AppIconName;
  label: string;
  mode: ThemeMode;
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'profile');

  const themeOptions: ThemeOption[] = [
    {
      icon: { android: 'settings_brightness', ios: 'circle.lefthalf.filled' },
      label: t('profile.themeSystem'),
      mode: 'system',
    },
    {
      icon: { android: 'light_mode', ios: 'sun.max' },
      label: t('profile.themeLight'),
      mode: 'light',
    },
    {
      icon: { android: 'dark_mode', ios: 'moon' },
      label: t('profile.themeDark'),
      mode: 'dark',
    },
  ];

  return (
    <Screen>
      <View style={styles.topBar}>
        <BrandLockup />
        <ThemeQuickToggle />
      </View>

      <View style={styles.headerSpacing}>
        <SectionHeader
          description={t('profile.description')}
          eyebrow={t('profile.eyebrow')}
          icon={{ android: 'person', ios: 'person.crop.circle' }}
          title={t('profile.title')}
          tone="profile"
        />
      </View>

      <PreviewNotice tone="profile">{t('profile.preview')}</PreviewNotice>

      <AppText accessibilityRole="header" style={styles.sectionTitle} variant="heading">
        {t('profile.appearanceTitle')}
      </AppText>
      <AppText color="textMuted" style={styles.sectionDescription} variant="caption">
        {t('profile.appearanceDescription')}
      </AppText>

      <View
        accessibilityRole="radiogroup"
        style={[
          styles.themePicker,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
          getPremiumDepth(theme, 'soft'),
        ]}
      >
        {themeOptions.map((option) => {
          const selected = theme.mode === option.mode;

          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={option.mode}
              onPress={() => theme.setMode(option.mode)}
              style={({ pressed }) => [
                styles.themeOption,
                selected && { backgroundColor: palette.soft },
                pressed && styles.pressed,
              ]}
            >
              <AppIcon
                name={option.icon}
                size={21}
                tintColor={selected ? palette.accent : theme.colors.textMuted}
                type="monochrome"
              />
              <AppText
                color={selected ? 'text' : 'textMuted'}
                style={styles.themeLabel}
                variant="caption"
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <AppText accessibilityRole="header" style={styles.preferencesTitle} variant="heading">
        {t('profile.preferencesTitle')}
      </AppText>

      <View
        style={[
          styles.preferencesCard,
          { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
          getPremiumDepth(theme, 'raised'),
        ]}
      >
        <PreferenceRow
          icon={{ android: 'translate', ios: 'character.book.closed' }}
          label={t('profile.language')}
          value={t('profile.languageValue')}
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
        <PreferenceRow
          icon={{ android: 'text_fields', ios: 'textformat.size' }}
          label={t('profile.textSize')}
          value={t('profile.textSizeValue')}
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
        <PreferenceRow
          icon={{ android: 'lock', ios: 'lock.shield' }}
          label={t('profile.privacy')}
          value={t('profile.privacyValue')}
        />
      </View>
    </Screen>
  );
}

function PreferenceRow({
  icon,
  label,
  value,
}: {
  icon: AppIconName;
  label: string;
  value: string;
}) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'profile');

  return (
    <View style={styles.preferenceRow}>
      <View style={[styles.preferenceIcon, { backgroundColor: palette.soft }]}>
        <AppIcon name={icon} size={20} tintColor={palette.accent} type="monochrome" />
      </View>
      <View style={styles.preferenceCopy}>
        <AppText style={styles.preferenceLabel}>{label}</AppText>
        <AppText color="textMuted" style={styles.preferenceValue} variant="caption">
          {value}
        </AppText>
      </View>
      <AppIcon
        name={{ android: 'chevron_right', ios: 'chevron.right' }}
        size={17}
        tintColor={theme.colors.textMuted}
        type="monochrome"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerSpacing: {
    marginTop: 22,
  },
  sectionTitle: {
    marginTop: 36,
  },
  sectionDescription: {
    marginTop: 4,
  },
  themePicker: {
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
    padding: 6,
  },
  themeOption: {
    alignItems: 'center',
    borderRadius: 17,
    flex: 1,
    gap: 6,
    minHeight: 76,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  themeLabel: {
    fontFamily: fonts.sansSemibold,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  preferencesTitle: {
    marginTop: 36,
  },
  preferencesCard: {
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 16,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  preferenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 82,
  },
  preferenceIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  preferenceCopy: {
    flex: 1,
    marginHorizontal: 13,
  },
  preferenceLabel: {
    fontFamily: fonts.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
  },
  preferenceValue: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
});
