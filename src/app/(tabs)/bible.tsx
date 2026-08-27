import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { BrandLockup } from '@/components/BrandLockup';
import { EditorialActionCard } from '@/components/EditorialActionCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ThemeQuickToggle } from '@/components/ThemeQuickToggle';
import {
  getBook,
  getLastReading,
  getTranslations,
  getVerse,
} from '@/features/bible/repository';
import type {
  BibleBook,
  BibleTranslation,
  BibleVerse,
  ReadingLocation,
} from '@/features/bible/types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

export default function BibleScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'bible');
  const [dailyVerse, setDailyVerse] = useState<BibleVerse | null>(null);
  const [lastReading, setLastReading] = useState<ReadingLocation | null>(null);
  const [lastBook, setLastBook] = useState<BibleBook | null>(null);
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void Promise.all([
        getVerse(database, 'rvr1909', 'PSA', 46, 10),
        getLastReading(database),
        getTranslations(database),
      ]).then(async ([verse, reading, availableTranslations]) => {
        const book = await getBook(database, reading.bookId);
        if (!active) return;
        setDailyVerse(verse);
        setLastReading(reading);
        setLastBook(book);
        setTranslations(availableTranslations);
      });
      return () => {
        active = false;
      };
    }, [database]),
  );

  const continueTitle = lastBook && lastReading
    ? `${lastBook.nameEs} ${lastReading.chapter}`
    : t('bible.continueCardTitle');
  const continueDescription = lastReading?.verse
    ? t('bible.continueAtVerse', { verse: lastReading.verse })
    : t('bible.continueDescription');
  const translationLabel = useMemo(
    () => translations.map((translation) => translation.shortName).join(' · '),
    [translations],
  );

  const openReader = (location: ReadingLocation) => {
    router.push({
      pathname: '/bible/reader',
      params: {
        bookId: location.bookId,
        chapter: String(location.chapter),
        ...(location.verse ? { verse: String(location.verse) } : {}),
        versionId: location.versionId,
      },
    });
  };

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

      <View
        style={[
          styles.offlineBanner,
          { backgroundColor: palette.soft, borderColor: palette.accent },
        ]}
      >
        <AppIcon
          name={{ android: 'offline_pin', ios: 'checkmark.icloud' }}
          size={20}
          tintColor={palette.accent}
          type="monochrome"
        />
        <View style={styles.offlineCopy}>
          <AppText style={[styles.offlineTitle, { color: palette.accent }]}>
            {t('bible.offlineReady')}
          </AppText>
          <AppText color="textMuted" style={styles.offlineDescription} variant="caption">
            {t('bible.offlineDescription', { versions: translationLabel || 'RVR1909 · WEB' })}
          </AppText>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <AppText color="textMuted" variant="eyebrow">
          {t('bible.todayEyebrow')}
        </AppText>
        <AppText accessibilityRole="header" style={styles.sectionTitle} variant="heading">
          {t('bible.todayTitle')}
        </AppText>
      </View>

      <Pressable
        accessibilityHint={t('bible.openDailyHint')}
        accessibilityLabel={t('bible.readChapter')}
        accessibilityRole="button"
        onPress={() =>
          openReader({ versionId: 'rvr1909', bookId: 'PSA', chapter: 46, verse: 10 })
        }
        style={({ pressed }) => [
          styles.verseCard,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.outline,
          },
          getPremiumDepth(theme, 'floating'),
          pressed && styles.pressed,
        ]}
      >
        <AppText style={[styles.quoteMark, { color: palette.accent }]} variant="heroItalic">
          “
        </AppText>
        <AppText style={styles.verse} variant="heading">
          {dailyVerse?.text ?? t('bible.verse')}
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
      </Pressable>

      <AppText accessibilityRole="header" style={styles.continueTitle} variant="heading">
        {t('bible.continueTitle')}
      </AppText>
      <View style={styles.cardList}>
        <EditorialActionCard
          description={continueDescription}
          icon={{ android: 'history', ios: 'clock.arrow.circlepath' }}
          meta={t('bible.continueMeta')}
          onPress={() =>
            openReader(
              lastReading ?? { versionId: 'rvr1909', bookId: 'PSA', chapter: 23, verse: 1 },
            )
          }
          title={continueTitle}
          tone="bible"
        />
        <EditorialActionCard
          description={t('bible.searchDescription')}
          icon={{ android: 'search', ios: 'magnifyingglass' }}
          onPress={() => router.push('/bible/search')}
          title={t('bible.searchTitle')}
          tone="bible"
        />
      </View>

      <Pressable
        accessibilityHint={t('bible.sources.openHint')}
        accessibilityLabel={t('bible.licenseTitle')}
        accessibilityRole="button"
        onPress={() => router.push('/bible/sources' as Href)}
        style={[
          styles.licenseCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
        ]}
      >
        <AppIcon
          name={{ android: 'verified', ios: 'checkmark.seal' }}
          size={20}
          tintColor={palette.accent}
          type="monochrome"
        />
        <View style={styles.licenseCopy}>
          <AppText style={styles.licenseTitle}>{t('bible.licenseTitle')}</AppText>
          <AppText color="textMuted" style={styles.licenseDescription} variant="caption">
            {t('bible.licenseDescription')}
          </AppText>
        </View>
        <AppIcon
          name={{ android: 'arrow_forward', ios: 'arrow.right' }}
          size={18}
          tintColor={theme.colors.textMuted}
          type="monochrome"
        />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerSpacing: { marginTop: 22 },
  offlineBanner: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 24,
    padding: 14,
  },
  offlineCopy: { flex: 1, marginLeft: 12 },
  offlineTitle: { fontFamily: fonts.sansBold, fontSize: 13 },
  offlineDescription: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  sectionHeading: { marginTop: 34 },
  sectionTitle: { marginTop: 5 },
  verseCard: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  quoteMark: { fontSize: 48, height: 40, lineHeight: 52 },
  verse: {
    fontFamily: fonts.serifMedium,
    fontSize: 31,
    lineHeight: 37,
    maxWidth: 440,
    textAlign: 'center',
  },
  reference: { fontSize: 11, marginTop: 16 },
  verseRule: { height: StyleSheet.hairlineWidth, marginTop: 22, width: '100%' },
  readRow: { alignItems: 'center', flexDirection: 'row', minHeight: 70, width: '100%' },
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
  continueTitle: { marginTop: 36 },
  cardList: { gap: 10, marginTop: 16 },
  licenseCard: {
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 26,
    padding: 16,
  },
  licenseCopy: { flex: 1, marginLeft: 12 },
  licenseTitle: { fontFamily: fonts.sansSemibold, fontSize: 13 },
  licenseDescription: { fontSize: 11, lineHeight: 17, marginTop: 3 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
});
