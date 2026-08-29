import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type View as NativeView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { ScreenReveal } from '@/components/ScreenReveal';
import { ShareCard } from '@/features/sharing/ShareCard';
import { createShareImage } from '@/features/sharing/createShareImage';
import { copyShareText, shareGeneratedImage } from '@/features/sharing/shareActions';
import {
  DEFAULT_SHARE_OPTIONS,
  SHARE_TEMPLATES,
  type ShareAspect,
  type ShareCardAlignment,
  type ShareCardOptions,
  type ShareContent,
  type ShareTextSize,
} from '@/features/sharing/shareTemplates';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

export type ShareContentOption = {
  content: ShareContent;
  id: string;
  label: string;
};

type ShareComposerProps = {
  contentOptions: readonly ShareContentOption[];
  initialContentId?: string;
};

export function ShareComposer({ contentOptions, initialContentId }: ShareComposerProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'bible');
  const cardRef = useRef<NativeView>(null);
  const initialOption =
    contentOptions.find((option) => option.id === initialContentId) ?? contentOptions[0];
  const [selectedContentId, setSelectedContentId] = useState(initialOption.id);
  const [options, setOptions] = useState<ShareCardOptions>(DEFAULT_SHARE_OPTIONS);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const selectedContent =
    contentOptions.find((option) => option.id === selectedContentId)?.content ?? initialOption.content;

  const updateOptions = <Key extends keyof ShareCardOptions>(
    key: Key,
    value: ShareCardOptions[Key],
  ) => {
    setOptions((current) => ({ ...current, [key]: value }));
    setStatusMessage(null);
  };

  const handleCopy = async () => {
    try {
      await copyShareText(selectedContent);
      setStatusMessage(t('sharing.copied'));
    } catch {
      Alert.alert(t('sharing.errorTitle'), t('sharing.copyError'));
    }
  };

  const handleShare = async () => {
    if (busy) return;
    setBusy(true);
    setStatusMessage(null);
    try {
      const image = await createShareImage(cardRef.current, selectedContent, options);
      const outcome = await shareGeneratedImage(image, selectedContent);
      if (outcome === 'downloaded') setStatusMessage(t('sharing.downloaded'));
      if (outcome === 'shared') setStatusMessage(t('sharing.ready'));
    } catch {
      Alert.alert(t('sharing.errorTitle'), t('sharing.errorMessage'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <ScreenReveal>
          <View style={styles.topBar}>
            <Pressable
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.roundButton,
                {
                  backgroundColor: theme.colors.surfaceElevated,
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
            <AppText color="textMuted" style={styles.topTitle} variant="eyebrow">
              {t('sharing.eyebrow')}
            </AppText>
            <View style={styles.roundButton} />
          </View>

          <View style={styles.intro}>
            <AppText accessibilityRole="header" variant="hero">
              {t('sharing.title')}
            </AppText>
            <AppText color="textMuted" style={styles.description}>
              {t('sharing.description')}
            </AppText>
          </View>

          {contentOptions.length > 1 ? (
            <ControlSection label={t('sharing.content')}>
              <View style={styles.segmentedRow}>
                {contentOptions.map((option) => (
                  <ChoiceButton
                    active={selectedContentId === option.id}
                    key={option.id}
                    label={option.label}
                    onPress={() => {
                      setSelectedContentId(option.id);
                      setStatusMessage(null);
                    }}
                  />
                ))}
              </View>
            </ControlSection>
          ) : null}

          <View
            style={[
              styles.previewShell,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.outline,
              },
              getPremiumDepth(theme, 'floating'),
            ]}
          >
            <View
              style={[
                styles.previewFrame,
                options.aspect === 'story' ? styles.previewStory : styles.previewSquare,
              ]}
            >
              <ShareCard content={selectedContent} options={options} ref={cardRef} />
            </View>
            <AppText color="textMuted" style={styles.previewCaption} variant="caption">
              {t('sharing.previewCaption')}
            </AppText>
          </View>

          <ControlSection label={t('sharing.format')}>
            <View style={styles.segmentedRow}>
              <ChoiceButton
                active={options.aspect === 'square'}
                label={t('sharing.square')}
                onPress={() => updateOptions('aspect', 'square' satisfies ShareAspect)}
              />
              <ChoiceButton
                active={options.aspect === 'story'}
                label={t('sharing.story')}
                onPress={() => updateOptions('aspect', 'story' satisfies ShareAspect)}
              />
            </View>
          </ControlSection>

          <ControlSection label={t('sharing.template')}>
            <View style={styles.templateGrid}>
              {SHARE_TEMPLATES.map((template) => {
                const active = options.templateId === template.id;
                return (
                  <Pressable
                    accessibilityLabel={template.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    key={template.id}
                    onPress={() => updateOptions('templateId', template.id)}
                    style={({ pressed }) => [
                      styles.templateButton,
                      {
                        backgroundColor: template.background,
                        borderColor: active ? palette.accent : theme.colors.outline,
                        borderWidth: active ? 3 : 1,
                        opacity: pressed ? 0.78 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.templateAccent, { backgroundColor: template.accent }]} />
                    <AppText style={[styles.templateLabel, { color: template.text }]} variant="caption">
                      {template.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </ControlSection>

          <ControlSection label={t('sharing.alignment')}>
            <View style={styles.segmentedRow}>
              <ChoiceButton
                active={options.alignment === 'left'}
                label={t('sharing.alignLeft')}
                onPress={() => updateOptions('alignment', 'left' satisfies ShareCardAlignment)}
              />
              <ChoiceButton
                active={options.alignment === 'center'}
                label={t('sharing.alignCenter')}
                onPress={() => updateOptions('alignment', 'center' satisfies ShareCardAlignment)}
              />
            </View>
          </ControlSection>

          <ControlSection label={t('sharing.textSize')}>
            <View style={styles.segmentedRow}>
              {(
                [
                  ['compact', t('sharing.textCompact')],
                  ['comfortable', t('sharing.textComfortable')],
                  ['large', t('sharing.textLarge')],
                ] as const satisfies readonly (readonly [ShareTextSize, string])[]
              ).map(([value, label]) => (
                <ChoiceButton
                  active={options.textSize === value}
                  key={value}
                  label={label}
                  onPress={() => updateOptions('textSize', value)}
                />
              ))}
            </View>
          </ControlSection>

          <View
            style={[
              styles.licenseNote,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
            ]}
          >
            <AppIcon
              name={{ android: 'verified', ios: 'checkmark.seal' }}
              size={20}
              tintColor={palette.accent}
            />
            <AppText color="textMuted" style={styles.licenseCopy} variant="caption">
              {t('sharing.licenseNote')}
            </AppText>
          </View>

          <View style={styles.actionStack}>
            <AppButton
              disabled={busy}
              icon={{ android: 'ios_share', ios: 'square.and.arrow.up' }}
              label={busy ? t('sharing.generating') : t('sharing.shareImage')}
              onPress={() => void handleShare()}
            />
            <AppButton
              disabled={busy}
              icon={{ android: 'content_copy', ios: 'doc.on.doc' }}
              label={t('sharing.copyText')}
              onPress={() => void handleCopy()}
              variant="secondary"
            />
            {busy ? <ActivityIndicator color={palette.accent} /> : null}
            {statusMessage ? (
              <AppText color="success" style={styles.status} variant="caption">
                {statusMessage}
              </AppText>
            ) : null}
          </View>
        </ScreenReveal>
      </ScrollView>
    </SafeAreaView>
  );
}

function ControlSection({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View style={styles.controlSection}>
      <AppText color="textMuted" style={styles.controlLabel} variant="eyebrow">
        {label}
      </AppText>
      {children}
    </View>
  );
}

function ChoiceButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'bible');
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceButton,
        {
          backgroundColor: active ? palette.soft : theme.colors.surface,
          borderColor: active ? palette.accent : theme.colors.outline,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <AppText style={[styles.choiceLabel, { color: active ? palette.accent : theme.colors.text }]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: {
    alignSelf: 'center',
    maxWidth: 760,
    paddingBottom: 44,
    paddingHorizontal: 20,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  roundButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  topTitle: { fontSize: 11 },
  intro: { marginTop: 30 },
  description: { lineHeight: 25, marginTop: 10, maxWidth: 620 },
  previewShell: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 28,
    padding: 18,
  },
  previewFrame: { alignSelf: 'center', width: '100%' },
  previewSquare: { maxWidth: 430 },
  previewStory: { maxWidth: 300 },
  previewCaption: { marginTop: 14, textAlign: 'center' },
  controlSection: { gap: 10, marginTop: 24 },
  controlLabel: { fontSize: 10 },
  segmentedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 94,
    paddingHorizontal: 14,
  },
  choiceLabel: { fontFamily: fonts.sansSemibold, fontSize: 12, textAlign: 'center' },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  templateButton: {
    borderRadius: 17,
    justifyContent: 'space-between',
    minHeight: 84,
    padding: 12,
    width: '47.5%',
  },
  templateAccent: { borderRadius: 10, height: 24, width: 24 },
  templateLabel: { fontFamily: fonts.sansSemibold, fontSize: 11 },
  licenseNote: {
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    padding: 16,
  },
  licenseCopy: { flex: 1, lineHeight: 20 },
  actionStack: { gap: 10, marginTop: 22 },
  status: { textAlign: 'center' },
});
