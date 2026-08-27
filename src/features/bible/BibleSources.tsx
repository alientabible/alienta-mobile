import { useRouter } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { BIBLE_LICENSES } from '@/features/bible/license';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

function formatVerifiedDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00Z`));
}

export function BibleSources() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'bible');

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.roundButton,
            { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
            pressed && styles.pressed,
          ]}
        >
          <AppIcon
            name={{ android: 'arrow_back', ios: 'chevron.left' }}
            size={21}
            tintColor={theme.colors.text}
          />
        </Pressable>
        <AppText color="textMuted" style={styles.topTitle} variant="eyebrow">
          {t('bible.sources.eyebrow')}
        </AppText>
        <View style={styles.roundButton} />
      </View>

      <AppText accessibilityRole="header" style={styles.title} variant="hero">
        {t('bible.sources.title')}
      </AppText>
      <AppText color="textMuted" style={styles.description}>
        {t('bible.sources.description')}
      </AppText>

      <View style={[styles.summary, { backgroundColor: palette.soft }]}>
        <AppIcon
          name={{ android: 'verified', ios: 'checkmark.seal.fill' }}
          size={22}
          tintColor={palette.accent}
          type="monochrome"
        />
        <AppText style={[styles.summaryText, { color: palette.accent }]} variant="caption">
          {t('bible.sources.summary')}
        </AppText>
      </View>

      <View style={styles.cardList}>
        {BIBLE_LICENSES.map((license) => (
          <View
            key={license.versionId}
            style={[
              styles.sourceCard,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
              getPremiumDepth(theme, 'raised'),
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.versionMark, { backgroundColor: palette.soft }]}>
                <AppText style={[styles.versionMarkText, { color: palette.accent }]} variant="eyebrow">
                  {license.shortName}
                </AppText>
              </View>
              <View style={[styles.badge, { borderColor: palette.accent }]}>
                <AppText style={[styles.badgeText, { color: palette.accent }]} variant="caption">
                  {t('bible.sources.publicDomain')}
                </AppText>
              </View>
            </View>

            <AppText style={styles.sourceTitle} variant="heading">
              {license.displayName}
            </AppText>

            <View style={[styles.rule, { backgroundColor: theme.colors.outline }]} />

            <View style={styles.details}>
              <DetailRow
                label={t('bible.sources.language')}
                value={t(
                  license.languageTag === 'es'
                    ? 'bible.sources.languageEs'
                    : 'bible.sources.languageEn',
                )}
              />
              <DetailRow label={t('bible.sources.canon')} value={t('bible.sources.canonValue')} />
              <DetailRow label={t('bible.sources.source')} value="eBible.org" />
              <DetailRow
                label={t('bible.sources.verified')}
                value={formatVerifiedDate(license.verifiedAt)}
              />
              <DetailRow
                label={t('bible.sources.fingerprint')}
                value={`${license.sourceSha256.slice(0, 12)}…${license.sourceSha256.slice(-8)}`}
              />
            </View>

            <AppText color="textMuted" style={styles.attribution} variant="caption">
              {license.attribution}
            </AppText>

            <Pressable
              accessibilityHint={t('bible.sources.openOfficialHint', {
                version: license.shortName,
              })}
              accessibilityLabel={t('bible.sources.openOfficial')}
              accessibilityRole="link"
              onPress={() => {
                void Linking.openURL(license.licenseUrl).catch(() => {
                  Alert.alert(t('bible.sources.openOfficial'), t('bible.sources.cannotOpen'));
                });
              }}
              style={({ pressed }) => [
                styles.sourceLink,
                { borderColor: theme.colors.outline },
                pressed && styles.pressed,
              ]}
            >
              <AppText style={[styles.sourceLinkText, { color: palette.accent }]}>
                {t('bible.sources.openOfficial')}
              </AppText>
              <AppIcon
                name={{ android: 'open_in_new', ios: 'arrow.up.right' }}
                size={17}
                tintColor={palette.accent}
                type="monochrome"
              />
            </Pressable>
          </View>
        ))}
      </View>

      <View style={[styles.footer, { borderColor: theme.colors.outline }]}>
        <AppIcon
          name={{ android: 'shield', ios: 'checkmark.shield' }}
          size={21}
          tintColor={palette.accent}
          type="monochrome"
        />
        <AppText color="textMuted" style={styles.footerText} variant="caption">
          {t('bible.sources.footer')}
        </AppText>
      </View>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <AppText color="textMuted" style={styles.detailLabel} variant="caption">
        {label}
      </AppText>
      <AppText style={styles.detailValue} variant="caption">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 48 },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundButton: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  topTitle: { fontSize: 11 },
  title: { marginTop: 30, maxWidth: 560 },
  description: { marginTop: 12, maxWidth: 620 },
  summary: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryText: {
    flex: 1,
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 11,
  },
  cardList: { gap: 18, marginTop: 28 },
  sourceCard: { borderRadius: 26, borderWidth: 1, padding: 20 },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  versionMark: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  versionMarkText: { fontSize: 10, lineHeight: 14 },
  badge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontFamily: fonts.sansSemibold, fontSize: 10, lineHeight: 15 },
  sourceTitle: { fontSize: 27, lineHeight: 32, marginTop: 16 },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: 18 },
  details: { gap: 10 },
  detailRow: { alignItems: 'flex-start', flexDirection: 'row' },
  detailLabel: { fontSize: 12, lineHeight: 18, width: 112 },
  detailValue: {
    flex: 1,
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
  },
  attribution: { fontSize: 11, lineHeight: 17, marginTop: 18 },
  sourceLink: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 48,
  },
  sourceLinkText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    marginRight: 8,
  },
  footer: {
    alignItems: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginTop: 30,
    paddingTop: 22,
  },
  footerText: { flex: 1, fontSize: 11, lineHeight: 18, marginLeft: 12 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
