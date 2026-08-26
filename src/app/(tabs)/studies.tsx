import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { BrandLockup } from '@/components/BrandLockup';
import { EditorialActionCard } from '@/components/EditorialActionCard';
import { PreviewNotice } from '@/components/PreviewNotice';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ThemeQuickToggle } from '@/components/ThemeQuickToggle';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts, getSectionPalette } from '@/theme/tokens';

export default function StudiesScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'studies');

  return (
    <Screen>
      <View style={styles.topBar}>
        <BrandLockup />
        <ThemeQuickToggle />
      </View>

      <View style={styles.headerSpacing}>
        <SectionHeader
          description={t('studies.description')}
          eyebrow={t('studies.eyebrow')}
          icon={{ android: 'school', ios: 'graduationcap' }}
          title={t('studies.title')}
          tone="studies"
        />
      </View>

      <PreviewNotice tone="studies">{t('studies.preview')}</PreviewNotice>

      <AppText accessibilityRole="header" style={styles.sectionTitle} variant="heading">
        {t('studies.activeTitle')}
      </AppText>

      <View
        style={[
          styles.progressCard,
          { backgroundColor: palette.accent, shadowColor: theme.colors.shadow },
        ]}
      >
        <View style={styles.progressTopRow}>
          <AppText style={[styles.progressEyebrow, { color: palette.onAccent }]} variant="eyebrow">
            {t('studies.activeEyebrow')}
          </AppText>
          <View style={[styles.dayPill, { backgroundColor: palette.onAccent }]}>
            <AppText style={[styles.dayPillText, { color: palette.accent }]} variant="caption">
              {t('studies.activeDay')}
            </AppText>
          </View>
        </View>
        <AppText style={[styles.progressTitle, { color: palette.onAccent }]} variant="heading">
          {t('studies.activePlan')}
        </AppText>
        <AppText style={[styles.progressDescription, { color: palette.onAccent }]} variant="caption">
          {t('studies.activeDescription')}
        </AppText>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.progressFill, { backgroundColor: palette.onAccent }]} />
        </View>
        <View style={styles.progressFooter}>
          <AppText style={[styles.progressMeta, { color: palette.onAccent }]} variant="caption">
            {t('studies.progress')}
          </AppText>
          <AppText style={[styles.progressMeta, { color: palette.onAccent }]} variant="caption">
            43%
          </AppText>
        </View>
      </View>

      <AppText accessibilityRole="header" style={styles.exploreTitle} variant="heading">
        {t('studies.exploreTitle')}
      </AppText>
      <View style={styles.cardList}>
        <EditorialActionCard
          description={t('studies.planOneDescription')}
          icon={{ android: 'wb_sunny', ios: 'sun.max' }}
          meta={t('studies.sevenDays')}
          title={t('studies.planOneTitle')}
          tone="studies"
        />
        <EditorialActionCard
          description={t('studies.planTwoDescription')}
          icon={{ android: 'favorite_border', ios: 'heart' }}
          meta={t('studies.sevenDays')}
          title={t('studies.planTwoTitle')}
          tone="studies"
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
  sectionTitle: {
    marginTop: 36,
  },
  progressCard: {
    borderRadius: 28,
    elevation: 3,
    marginTop: 16,
    padding: 22,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
  },
  progressTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressEyebrow: {
    fontSize: 10,
  },
  dayPill: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  dayPillText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    lineHeight: 15,
  },
  progressTitle: {
    fontFamily: fonts.serifSemibold,
    fontSize: 31,
    lineHeight: 35,
    marginTop: 25,
    maxWidth: 310,
  },
  progressDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    opacity: 0.86,
  },
  progressTrack: {
    borderRadius: 4,
    height: 6,
    marginTop: 24,
    opacity: 0.42,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
    height: 6,
    width: '43%',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  progressMeta: {
    fontFamily: fonts.sansSemibold,
    fontSize: 11,
    opacity: 0.9,
  },
  exploreTitle: {
    marginTop: 36,
  },
  cardList: {
    gap: 10,
    marginTop: 16,
  },
});
