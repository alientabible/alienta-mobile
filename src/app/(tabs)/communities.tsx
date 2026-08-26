import { SymbolView } from 'expo-symbols';
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

export default function CommunitiesScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'communities');

  return (
    <Screen>
      <View style={styles.topBar}>
        <BrandLockup />
        <ThemeQuickToggle />
      </View>

      <View style={styles.headerSpacing}>
        <SectionHeader
          description={t('communities.description')}
          eyebrow={t('communities.eyebrow')}
          icon={{ android: 'groups', ios: 'person.3' }}
          title={t('communities.title')}
          tone="communities"
        />
      </View>

      <PreviewNotice tone="communities">{t('communities.preview')}</PreviewNotice>

      <View
        style={[
          styles.promiseCard,
          { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
        ]}
      >
        <View style={styles.peopleGraphic}>
          <View style={[styles.person, styles.personLeft, { backgroundColor: palette.soft }]} />
          <View style={[styles.person, styles.personTop, { backgroundColor: palette.accent }]} />
          <View style={[styles.person, styles.personRight, { backgroundColor: palette.soft }]} />
          <View style={[styles.centerMark, { backgroundColor: palette.accent }]}>
            <SymbolView
              name={{ android: 'favorite', ios: 'heart.fill' }}
              size={17}
              tintColor={palette.onAccent}
              type="monochrome"
            />
          </View>
        </View>
        <AppText style={[styles.promiseEyebrow, { color: palette.accent }]} variant="eyebrow">
          {t('communities.promiseEyebrow')}
        </AppText>
        <AppText style={styles.promiseTitle} variant="heading">
          {t('communities.promiseTitle')}
        </AppText>
        <AppText color="textMuted" style={styles.promiseDescription} variant="caption">
          {t('communities.promiseDescription')}
        </AppText>
      </View>

      <AppText accessibilityRole="header" style={styles.sectionTitle} variant="heading">
        {t('communities.circlesTitle')}
      </AppText>
      <View style={styles.cardList}>
        <EditorialActionCard
          description={t('communities.circleOneDescription')}
          icon={{ android: 'diversity_3', ios: 'person.3' }}
          meta={t('communities.privateLabel')}
          title={t('communities.circleOneTitle')}
          tone="communities"
        />
        <EditorialActionCard
          description={t('communities.circleTwoDescription')}
          icon={{ android: 'church', ios: 'building.columns' }}
          meta={t('communities.invitationLabel')}
          title={t('communities.circleTwoTitle')}
          tone="communities"
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
  promiseCard: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 32,
    padding: 24,
  },
  peopleGraphic: {
    height: 112,
    marginBottom: 20,
    width: 150,
  },
  person: {
    borderRadius: 28,
    height: 56,
    opacity: 0.72,
    position: 'absolute',
    width: 56,
  },
  personLeft: {
    left: 5,
    top: 38,
  },
  personTop: {
    left: 47,
    opacity: 0.34,
    top: 2,
  },
  personRight: {
    right: 5,
    top: 38,
  },
  centerMark: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    left: 53,
    position: 'absolute',
    top: 54,
    width: 44,
  },
  promiseEyebrow: {
    fontSize: 10,
  },
  promiseTitle: {
    fontFamily: fonts.serifSemibold,
    fontSize: 30,
    lineHeight: 34,
    marginTop: 7,
    textAlign: 'center',
  },
  promiseDescription: {
    lineHeight: 20,
    marginTop: 9,
    maxWidth: 320,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 36,
  },
  cardList: {
    gap: 10,
    marginTop: 16,
  },
});
