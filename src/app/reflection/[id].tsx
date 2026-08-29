import { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { BrandLockup } from '@/components/BrandLockup';
import { PreviewNotice } from '@/components/PreviewNotice';
import { ScreenReveal } from '@/components/ScreenReveal';
import {
  getMockReflection,
  isReflectionId,
} from '@/features/reflection/mockReflection';
import type { StandardReflectionId } from '@/features/reflection/types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette, type AppTheme } from '@/theme/tokens';

const mentalHealthDirectoryUrl =
  'https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/VS/PP/ET/directorio-salud-mental-prevencion-suicidio-minsalud.pdf';

type FeedbackValue = 'helpful' | 'notHelpful';

export default function ReflectionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [feedback, setFeedback] = useState<FeedbackValue | null>(null);
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const reflectionId = isReflectionId(rawId) ? rawId : 'other';

  const openUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // El mensaje visible evita que un fallo del sistema deje al usuario sin orientación.
    }

    Alert.alert(t('reflection.cannotOpenTitle'), t('reflection.cannotOpenMessage'));
  };

  const goHome = () => router.replace('/');

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenReveal>
          <View style={styles.topBar}>
            <Pressable
              accessibilityLabel={t('reflection.back')}
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <AppIcon
                name={{ android: 'arrow_back', ios: 'chevron.left' }}
                size={21}
                tintColor={theme.colors.text}
              />
            </Pressable>
            <BrandLockup />
            <View style={styles.headerSpacer} />
          </View>

          {reflectionId === 'urgent' ? (
            <View style={styles.urgentContent}>
              <View
                style={[
                  styles.heroCard,
                  { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent },
                  getPremiumDepth(theme, 'raised'),
                ]}
              >
                <View style={[styles.heroIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
                  <AppIcon
                    name={{ android: 'health_and_safety', ios: 'heart.text.square' }}
                    size={27}
                    tintColor={theme.colors.accent}
                  />
                </View>
                <AppText color="accent" style={styles.eyebrow} variant="eyebrow">
                  {t('reflection.urgent.eyebrow')}
                </AppText>
                <AppText accessibilityRole="header" style={styles.urgentTitle} variant="hero">
                  {t('reflection.urgent.title')}
                </AppText>
                <View style={[styles.rule, { backgroundColor: theme.colors.accent }]} />
                <AppText color="textMuted" style={styles.intro}>
                  {t('reflection.urgent.description')}
                </AppText>
              </View>

              <View
                style={[
                  styles.safetyCard,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: theme.colors.outline,
                  },
                  getPremiumDepth(theme, 'soft'),
                ]}
              >
                <AppText accessibilityRole="header" variant="heading">
                  {t('reflection.urgent.actionTitle')}
                </AppText>
                <AppText color="textMuted" style={styles.safetyText}>
                  {t('reflection.urgent.actionDescription')}
                </AppText>
                <View style={styles.buttonStack}>
                  <AppButton
                    icon={{ android: 'call', ios: 'phone.fill' }}
                    label={t('reflection.urgent.call123')}
                    onPress={() => void openUrl('tel:123')}
                  />
                  <AppButton
                    icon={{ android: 'support_agent', ios: 'person.wave.2' }}
                    label={t('reflection.urgent.call106')}
                    onPress={() => void openUrl('tel:106')}
                    variant="secondary"
                  />
                  <AppButton
                    icon={{ android: 'open_in_new', ios: 'arrow.up.right.square' }}
                    label={t('reflection.urgent.directory')}
                    onPress={() => void openUrl(mentalHealthDirectoryUrl)}
                    variant="secondary"
                  />
                </View>
              </View>

              <PreviewNotice tone="home">{t('reflection.urgent.disclaimer')}</PreviewNotice>
              <AppButton label={t('reflection.startAgain')} onPress={goHome} variant="secondary" />
            </View>
          ) : (
            <StandardReflection
              feedback={feedback}
              id={reflectionId}
              onFeedback={setFeedback}
              onRestart={goHome}
              onShare={() =>
                router.push({
                  pathname: '/share',
                  params: { content: 'reflection', id: reflectionId, source: 'reflection' },
                })
              }
            />
          )}
        </ScreenReveal>
      </ScrollView>
    </SafeAreaView>
  );
}

type StandardReflectionProps = {
  feedback: FeedbackValue | null;
  id: StandardReflectionId;
  onFeedback: (value: FeedbackValue) => void;
  onRestart: () => void;
  onShare: () => void;
};

function StandardReflection({
  feedback,
  id,
  onFeedback,
  onRestart,
  onShare,
}: StandardReflectionProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'home');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const reflection = getMockReflection(id);

  return (
    <View>
      <View
        style={[
          styles.heroCard,
          { backgroundColor: palette.soft, borderColor: theme.colors.outline },
          getPremiumDepth(theme, 'floating'),
        ]}
      >
        <View style={[styles.heroIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
          <AppIcon
            name={{ android: 'spa', ios: 'leaf' }}
            size={27}
            tintColor={palette.accent}
          />
        </View>
        <AppText style={[styles.eyebrow, { color: palette.accent }]} variant="eyebrow">
          {reflection.eyebrow}
        </AppText>
        <AppText accessibilityRole="header" style={styles.resultTitle} variant="hero">
          {reflection.title}
        </AppText>
        <View style={[styles.rule, { backgroundColor: palette.accent }]} />
        <AppText color="textMuted" style={styles.intro}>
          {t('reflection.personalizedLocally')}
        </AppText>
      </View>

      <View
        style={[
          styles.verseCard,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.outline,
          },
          getPremiumDepth(theme, 'raised'),
        ]}
      >
        <AppText color="accent" style={styles.verseMark} variant="heroItalic">
          “
        </AppText>
        <AppText style={styles.verse} variant="serifBody">
          {reflection.verse}
        </AppText>
        <AppText style={[styles.reference, { color: palette.accent }]} variant="eyebrow">
          {reflection.reference}
        </AppText>
      </View>

      <ReflectionSection
        icon={{ android: 'auto_stories', ios: 'text.book.closed' }}
        text={reflection.reflection}
        title={t('reflection.reflectionTitle')}
      />
      <ReflectionSection
        icon={{ android: 'volunteer_activism', ios: 'hands.sparkles' }}
        text={reflection.prayer}
        title={t('reflection.prayerTitle')}
      />
      <ReflectionSection
        icon={{ android: 'check_circle_outline', ios: 'checkmark.circle' }}
        text={reflection.action}
        title={t('reflection.actionTitle')}
      />

      <PreviewNotice tone="home">{t('reflection.disclaimer')}</PreviewNotice>

      <View style={styles.shareAction}>
        <AppButton
          icon={{ android: 'ios_share', ios: 'square.and.arrow.up' }}
          label={t('reflection.share')}
          onPress={onShare}
        />
      </View>

      <View style={styles.feedbackBlock}>
        <AppText style={styles.feedbackTitle}>{t('reflection.feedbackTitle')}</AppText>
        <View style={styles.feedbackRow}>
          <FeedbackButton
            active={feedback === 'helpful'}
            icon={{ android: 'thumb_up', ios: 'hand.thumbsup' }}
            label={t('reflection.helpful')}
            onPress={() => onFeedback('helpful')}
          />
          <FeedbackButton
            active={feedback === 'notHelpful'}
            icon={{ android: 'thumb_down', ios: 'hand.thumbsdown' }}
            label={t('reflection.notHelpful')}
            onPress={() => onFeedback('notHelpful')}
          />
        </View>
        {feedback ? (
          <AppText color="textMuted" style={styles.feedbackConfirmation} variant="caption">
            {t('reflection.feedbackSaved')}
          </AppText>
        ) : null}
      </View>

      <AppButton
        icon={{ android: 'refresh', ios: 'arrow.clockwise' }}
        label={t('reflection.startAgain')}
        onPress={onRestart}
        variant="secondary"
      />
    </View>
  );
}

type ReflectionSectionProps = {
  icon: Parameters<typeof AppIcon>[0]['name'];
  text: string;
  title: string;
};

function ReflectionSection({ icon, text, title }: ReflectionSectionProps) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'home');

  return (
    <View
      style={[
        sharedStyles.sectionCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
        getPremiumDepth(theme, 'soft'),
      ]}
    >
      <View style={[sharedStyles.sectionIcon, { backgroundColor: palette.soft }]}>
        <AppIcon name={icon} size={21} tintColor={palette.accent} />
      </View>
      <View style={sharedStyles.sectionCopy}>
        <AppText color="accent" variant="eyebrow">
          {title}
        </AppText>
        <AppText style={sharedStyles.sectionText}>{text}</AppText>
      </View>
    </View>
  );
}

type FeedbackButtonProps = {
  active: boolean;
  icon: Parameters<typeof AppIcon>[0]['name'];
  label: string;
  onPress: () => void;
};

function FeedbackButton({ active, icon, label, onPress }: FeedbackButtonProps) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'home');

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        sharedStyles.feedbackButton,
        {
          backgroundColor: active ? palette.soft : theme.colors.surface,
          borderColor: active ? palette.accent : theme.colors.outline,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <AppIcon name={icon} size={19} tintColor={active ? palette.accent : theme.colors.textMuted} />
      <AppText style={sharedStyles.feedbackLabel} variant="caption">
        {label}
      </AppText>
    </Pressable>
  );
}

const sharedStyles = StyleSheet.create({
  sectionCard: {
    alignItems: 'flex-start',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginTop: 12,
    padding: 18,
  },
  sectionIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  sectionCopy: {
    flex: 1,
    gap: 7,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 23,
  },
  feedbackButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  feedbackLabel: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
  },
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    content: {
      alignSelf: 'center',
      maxWidth: 720,
      paddingBottom: 36,
      paddingHorizontal: 20,
      paddingTop: 12,
      width: '100%',
    },
    topBar: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    backButton: {
      alignItems: 'center',
      borderRadius: 24,
      borderWidth: 1,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    headerSpacer: {
      height: 48,
      width: 48,
    },
    heroCard: {
      borderRadius: 30,
      borderWidth: 1,
      marginTop: 22,
      overflow: 'hidden',
      padding: 24,
    },
    heroIcon: {
      alignItems: 'center',
      borderRadius: 24,
      height: 50,
      justifyContent: 'center',
      width: 50,
    },
    eyebrow: {
      marginTop: 22,
    },
    resultTitle: {
      fontSize: 40,
      lineHeight: 44,
      marginTop: 10,
    },
    urgentTitle: {
      fontSize: 39,
      lineHeight: 44,
      marginTop: 10,
    },
    rule: {
      borderRadius: 2,
      height: 2,
      marginTop: 20,
      width: 42,
    },
    intro: {
      fontSize: 15,
      lineHeight: 23,
      marginTop: 14,
    },
    verseCard: {
      alignItems: 'center',
      borderRadius: 28,
      borderWidth: 1,
      marginBottom: 10,
      marginTop: 24,
      padding: 24,
    },
    verseMark: {
      fontSize: 39,
      lineHeight: 34,
    },
    verse: {
      fontFamily: fonts.serifSemibold,
      fontSize: 29,
      lineHeight: 35,
      marginTop: 6,
      textAlign: 'center',
    },
    reference: {
      fontSize: 11,
      marginTop: 18,
      textAlign: 'center',
    },
    feedbackBlock: {
      marginBottom: 18,
      marginTop: 28,
    },
    shareAction: { marginTop: 18 },
    feedbackTitle: {
      fontFamily: fonts.sansSemibold,
      fontSize: 15,
      textAlign: 'center',
    },
    feedbackRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
    },
    feedbackConfirmation: {
      marginTop: 10,
      textAlign: 'center',
    },
    urgentContent: {
      paddingBottom: 8,
    },
    safetyCard: {
      borderRadius: 26,
      borderWidth: 1,
      marginTop: 20,
      padding: 20,
    },
    safetyText: {
      fontSize: 15,
      lineHeight: 23,
      marginTop: 10,
    },
    buttonStack: {
      gap: 10,
      marginTop: 20,
    },
  });
}
