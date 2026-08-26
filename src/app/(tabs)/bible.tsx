import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { BrandLockup } from '@/components/BrandLockup';
import { EditorialActionCard } from '@/components/EditorialActionCard';
import { PreviewNotice } from '@/components/PreviewNotice';
import { Screen } from '@/components/Screen';
import { ThemeQuickToggle } from '@/components/ThemeQuickToggle';
import { SectionHeader } from '@/components/SectionHeader';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

export default function BibleScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'bible');

  return (
    <Screen>
      <View style={styles.topBar}>
        <BrandLockup />
        <ThemeQuickToggle />
      </View>

      <View style={styles.headerSpacing}>
        <SectionHeader
          description={t('bible.description')}
          eyebrow={t('bible.eyebrow')}
          icon={{ android: 'menu_book', ios: 'book' }}
          title={t('bible.title')}
          tone="bible"
        />
      </View>

      <PreviewNotice tone="bible">{t('bible.preview')}</PreviewNotice>

      <View style={styles.sectionHeading}>
        <AppText color="textMuted" variant="eyebrow">
          {t('bible.todayEyebrow')}
        </AppText>
        <AppText accessibilityRole="header" style={styles.sectionTitle} variant="heading">
          {t('bible.todayTitle')}
        </AppText>
      </View>

      <View
        style={[
          styles.verseCard,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.outline,
          },
          getPremiumDepth(theme, 'floating'),
        ]}
      >
        <AppText style={[styles.quoteMark, { color: palette.accent }]} variant="heroItalic">
          “
        </AppText>
        <AppText style={styles.verse} variant="heading">
          {t('bible.verse')}
        </AppText>
        <AppText style={[styles.reference, { color: palette.accent }]} variant="eyebrow">
          {t('bible.reference')}
        </AppText>
        <View style={[styles.verseRule, { backgroundColor: theme.colors.outline }]} />
        <View style={styles.readRow}>
          <View style={[styles.readIcon, { backgroundColor: palette.soft }]}>
            <AppIcon
              name={{ android: 'auto_stories', ios: 'text.book.closed' }}
              size={20}
              tintColor={palette.accent}
              type="monochrome"
            />
          </View>
          <AppText style={styles.readLabel}>{t('bible.readChapter')}</AppText>
          <AppIcon
            name={{ android: 'arrow_forward', ios: 'arrow.right' }}
            size={18}
            tintColor={theme.colors.textMuted}
            type="monochrome"
          />
        </View>
      </View>

      <AppText accessibilityRole="header" style={styles.continueTitle} variant="heading">
        {t('bible.continueTitle')}
      </AppText>
      <View style={styles.cardList}>
        <EditorialActionCard
          description={t('bible.continueDescription')}
          icon={{ android: 'history', ios: 'clock.arrow.circlepath' }}
          meta={t('bible.continueMeta')}
          title={t('bible.continueCardTitle')}
          tone="bible"
        />
        <EditorialActionCard
          description={t('bible.searchDescription')}
          icon={{ android: 'search', ios: 'magnifyingglass' }}
          title={t('bible.searchTitle')}
          tone="bible"
        />
      </View>
    </Screen>
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
  sectionHeading: {
    marginTop: 34,
  },
  sectionTitle: {
    marginTop: 5,
  },
  verseCard: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  quoteMark: {
    fontSize: 48,
    height: 40,
    lineHeight: 52,
  },
  verse: {
    fontFamily: fonts.serifMedium,
    fontSize: 31,
    lineHeight: 37,
    maxWidth: 330,
    textAlign: 'center',
  },
  reference: {
    fontSize: 11,
    marginTop: 16,
  },
  verseRule: {
    height: StyleSheet.hairlineWidth,
    marginTop: 22,
    width: '100%',
  },
  readRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 70,
    width: '100%',
  },
  readIcon: {
    alignItems: 'center',
    borderRadius: 17,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  readLabel: {
    flex: 1,
    fontFamily: fonts.sansSemibold,
    fontSize: 14,
    marginLeft: 12,
  },
  continueTitle: {
    marginTop: 36,
  },
  cardList: {
    gap: 10,
    marginTop: 16,
  },
});
