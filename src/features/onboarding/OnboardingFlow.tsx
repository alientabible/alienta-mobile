import { type ReactNode, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { BrandLockup } from '@/components/BrandLockup';
import { AccountCard } from '@/features/account/AccountCard';
import { useReadingReminder } from '@/features/reminders/ReadingReminderProvider';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts } from '@/theme/tokens';

import {
  type OnboardingAnswers,
  type OnboardingEmotion,
  type ReadingRhythm,
} from './model';
import { useOnboarding } from './OnboardingProvider';
import {
  familiarityOptions,
  onboardingEmotionOptions,
  type OnboardingOption,
  purposeOptions,
  rhythmOptions,
} from './options';

const steps = ['language', 'purpose', 'familiarity', 'emotion', 'rhythm', 'account'] as const;
type StepId = (typeof steps)[number];

export function OnboardingFlow() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const reduceMotion = useReducedMotionPreference();
  const { answers, complete } = useOnboarding();
  const { activate: activateReminder } = useReadingReminder();
  const [draft, setDraft] = useState<OnboardingAnswers>(answers);
  const [stepIndex, setStepIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [cardMotion] = useState(() => new Animated.Value(0));
  const [finishMotion] = useState(() => new Animated.Value(1));
  const step = steps[stepIndex];

  const canContinue = useMemo(() => {
    if (step === 'language' || step === 'account') return true;
    if (step === 'purpose') return Boolean(draft.purpose);
    if (step === 'familiarity') return Boolean(draft.familiarity);
    if (step === 'emotion') return Boolean(draft.emotion);
    return Boolean(draft.rhythm);
  }, [draft, step]);

  function moveTo(nextIndex: number) {
    if (transitioning || nextIndex < 0 || nextIndex >= steps.length) return;

    if (reduceMotion) {
      setStepIndex(nextIndex);
      scrollRef.current?.scrollTo({ animated: false, y: 0 });
      return;
    }

    const direction = nextIndex > stepIndex ? -1 : 1;
    setTransitioning(true);
    Animated.timing(cardMotion, {
      duration: 145,
      easing: Easing.in(Easing.quad),
      toValue: direction,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setStepIndex(nextIndex);
      scrollRef.current?.scrollTo({ animated: false, y: 0 });
      cardMotion.setValue(-direction);
      Animated.timing(cardMotion, {
        duration: 285,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => setTransitioning(false));
    });
  }

  async function finish() {
    if (transitioning) return;
    setTransitioning(true);

    async function persistOnboarding() {
      if (draft.reminder.enabled) {
        await activateReminder(draft.reminder, draft.rhythm);
      }

      await complete(draft);
    }

    if (reduceMotion) {
      await persistOnboarding();
      return;
    }

    Animated.timing(finishMotion, {
      duration: 260,
      easing: Easing.inOut(Easing.cubic),
      toValue: 0,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      void persistOnboarding();
    });
  }

  function handleContinue() {
    if (stepIndex === steps.length - 1) {
      void finish();
      return;
    }
    moveTo(stepIndex + 1);
  }

  function handleSkip() {
    if (stepIndex === steps.length - 1) {
      void finish();
      return;
    }
    moveTo(stepIndex + 1);
  }

  const animatedCardStyle = {
    opacity: cardMotion.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0.12, 1, 0.12],
    }),
    transform: [
      {
        translateX: cardMotion.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-72, 0, 72],
        }),
      },
      {
        scale: cardMotion.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0.975, 1, 0.975],
        }),
      },
    ],
  };

  const finishStyle = {
    opacity: finishMotion,
    transform: [
      {
        scale: finishMotion.interpolate({
          inputRange: [0, 1],
          outputRange: [0.965, 1],
        }),
      },
    ],
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <Animated.View style={[styles.shell, finishStyle]}>
        <View style={styles.topBar}>
          <BrandLockup />
          <Pressable
            accessibilityRole="button"
            disabled={transitioning}
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
          >
            <AppText color="textMuted" style={styles.skipLabel} variant="caption">
              {t('onboarding.actions.skip')}
            </AppText>
          </Pressable>
        </View>

        <View accessibilityLabel={t('onboarding.progress', { current: stepIndex + 1, total: steps.length })} style={styles.progressRow}>
          {steps.map((item, index) => (
            <View
              key={item}
              style={[
                styles.progressSegment,
                {
                  backgroundColor:
                    index <= stepIndex ? theme.colors.primary : theme.colors.outline,
                },
              ]}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.outline,
              },
              getPremiumDepth(theme, 'floating'),
              animatedCardStyle,
            ]}
          >
            <StepContent draft={draft} onChange={setDraft} step={step} />
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.colors.outline }]}> 
          {stepIndex > 0 ? (
            <Pressable
              accessibilityRole="button"
              disabled={transitioning}
              onPress={() => moveTo(stepIndex - 1)}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <AppIcon
                name={{ android: 'arrow_back', ios: 'arrow.left' }}
                size={19}
                tintColor={theme.colors.textMuted}
                type="monochrome"
              />
              <AppText color="textMuted" style={styles.backLabel} variant="caption">
                {t('onboarding.actions.back')}
              </AppText>
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          <View style={styles.continueButton}>
            <AppButton
              disabled={!canContinue || transitioning}
              icon={{ android: 'arrow_forward', ios: 'arrow.right' }}
              label={
                step === 'account'
                  ? t('onboarding.actions.enter')
                  : t('onboarding.actions.continue')
              }
              onPress={handleContinue}
            />
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

function StepContent({
  draft,
  onChange,
  step,
}: {
  draft: OnboardingAnswers;
  onChange: (answers: OnboardingAnswers) => void;
  step: StepId;
}) {
  if (step === 'language') return <LanguageStep />;
  if (step === 'purpose') {
    return (
      <SelectionStep
        descriptionKey="onboarding.purpose.description"
        feedbackKey={draft.purpose ? 'onboarding.purpose.feedback' : undefined}
        onSelect={(purpose) => onChange({ ...draft, purpose })}
        options={purposeOptions}
        selected={draft.purpose}
        titleKey="onboarding.purpose.title"
      />
    );
  }
  if (step === 'familiarity') {
    return (
      <SelectionStep
        descriptionKey="onboarding.familiarity.description"
        feedbackKey={draft.familiarity ? 'onboarding.familiarity.feedback' : undefined}
        onSelect={(familiarity) => onChange({ ...draft, familiarity })}
        options={familiarityOptions}
        selected={draft.familiarity}
        titleKey="onboarding.familiarity.title"
      />
    );
  }
  if (step === 'emotion') {
    return (
      <EmotionStep
        onSelect={(emotion) => onChange({ ...draft, emotion })}
        selected={draft.emotion}
      />
    );
  }
  if (step === 'rhythm') return <RhythmStep draft={draft} onChange={onChange} />;
  return <AccountStep />;
}

function StepHeader({ descriptionKey, titleKey }: { descriptionKey: string; titleKey: string }) {
  const { t } = useTranslation();

  return (
    <View>
      <AppText color="primary" variant="eyebrow">
        {t('onboarding.eyebrow')}
      </AppText>
      <AppText accessibilityRole="header" style={styles.stepTitle} variant="hero">
        {t(titleKey)}
      </AppText>
      <AppText color="textMuted" style={styles.stepDescription}>
        {t(descriptionKey)}
      </AppText>
    </View>
  );
}

function LanguageStep() {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <View>
      <StepHeader
        descriptionKey="onboarding.language.description"
        titleKey="onboarding.language.title"
      />
      <View
        accessibilityRole="radiogroup"
        style={[
          styles.languageCard,
          { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
        ]}
      >
        <View style={[styles.optionIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
          <AppIcon
            name={{ android: 'translate', ios: 'character.book.closed' }}
            size={24}
            tintColor={theme.colors.primary}
            type="monochrome"
          />
        </View>
        <View style={styles.optionCopy}>
          <AppText style={styles.optionTitle}>{t('onboarding.language.spanishColombia')}</AppText>
          <AppText color="textMuted" variant="caption">
            {t('onboarding.language.available')}
          </AppText>
        </View>
        <AppIcon
          name={{ android: 'check_circle', ios: 'checkmark.circle.fill' }}
          size={23}
          tintColor={theme.colors.primary}
          type="monochrome"
        />
      </View>
      <InfoNote icon={{ android: 'language', ios: 'globe' }}>
        {t('onboarding.language.moreLanguages')}
      </InfoNote>
    </View>
  );
}

function SelectionStep<T extends string>({
  descriptionKey,
  feedbackKey,
  onSelect,
  options,
  selected,
  titleKey,
}: {
  descriptionKey: string;
  feedbackKey?: string;
  onSelect: (id: T) => void;
  options: OnboardingOption<T>[];
  selected?: T;
  titleKey: string;
}) {
  return (
    <View>
      <StepHeader descriptionKey={descriptionKey} titleKey={titleKey} />
      <View accessibilityRole="radiogroup" style={styles.optionList}>
        {options.map((option) => (
          <ChoiceCard
            key={option.id}
            onPress={() => onSelect(option.id)}
            option={option}
            selected={selected === option.id}
          />
        ))}
      </View>
      {feedbackKey ? (
        <InfoNote icon={{ android: 'auto_awesome', ios: 'sparkles' }}>{feedbackKey}</InfoNote>
      ) : null}
    </View>
  );
}

function ChoiceCard<T extends string>({
  onPress,
  option,
  selected,
}: {
  onPress: () => void;
  option: OnboardingOption<T>;
  selected: boolean;
}) {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={t(option.labelKey)}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.optionIcon,
          { backgroundColor: selected ? theme.colors.accentSoft : theme.colors.primarySoft },
        ]}
      >
        <AppIcon
          name={option.icon}
          size={23}
          tintColor={selected ? theme.colors.accent : theme.colors.primary}
          type="monochrome"
        />
      </View>
      <View style={styles.optionCopy}>
        <AppText style={styles.optionTitle}>{t(option.labelKey)}</AppText>
        {option.descriptionKey ? (
          <AppText color="textMuted" style={styles.optionDescription} variant="caption">
            {t(option.descriptionKey)}
          </AppText>
        ) : null}
      </View>
      <View
        style={[
          styles.radio,
          {
            backgroundColor: selected ? theme.colors.accent : 'transparent',
            borderColor: selected ? theme.colors.accent : theme.colors.outline,
          },
        ]}
      />
    </Pressable>
  );
}

function EmotionStep({
  onSelect,
  selected,
}: {
  onSelect: (emotion: OnboardingEmotion) => void;
  selected?: OnboardingEmotion;
}) {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <View>
      <StepHeader
        descriptionKey="onboarding.emotion.description"
        titleKey="onboarding.emotion.title"
      />
      <View accessibilityRole="radiogroup" style={styles.emotionGrid}>
        {onboardingEmotionOptions.map((option) => {
          const isSelected = option.id === selected;
          return (
            <Pressable
              accessibilityLabel={t(option.labelKey)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              key={option.id}
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [
                styles.emotionChip,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primarySoft
                    : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
                },
                pressed && styles.pressed,
              ]}
            >
              <AppIcon
                name={option.icon}
                size={18}
                tintColor={isSelected ? theme.colors.accent : theme.colors.textMuted}
                type="monochrome"
              />
              <AppText style={styles.emotionLabel} variant="caption">
                {t(option.labelKey)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {selected ? (
        <InfoNote icon={{ android: 'favorite_border', ios: 'heart' }}>
          {t('onboarding.emotion.feedback')}
        </InfoNote>
      ) : null}
    </View>
  );
}

function RhythmStep({
  draft,
  onChange,
}: {
  draft: OnboardingAnswers;
  onChange: (answers: OnboardingAnswers) => void;
}) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const canRemind = Boolean(draft.rhythm && draft.rhythm !== 'later');
  const totalMinutes = draft.reminder.hour * 60 + draft.reminder.minute;

  function selectRhythm(rhythm: ReadingRhythm) {
    onChange({
      ...draft,
      rhythm,
      reminder: {
        ...draft.reminder,
        enabled: rhythm === 'later' ? false : draft.reminder.enabled,
      },
    });
  }

  function adjustTime(delta: number) {
    const next = (totalMinutes + delta + 24 * 60) % (24 * 60);
    onChange({
      ...draft,
      reminder: {
        ...draft.reminder,
        hour: Math.floor(next / 60),
        minute: next % 60,
      },
    });
  }

  return (
    <View>
      <StepHeader
        descriptionKey="onboarding.rhythm.description"
        titleKey="onboarding.rhythm.title"
      />
      <View accessibilityRole="radiogroup" style={styles.optionList}>
        {rhythmOptions.map((option) => (
          <ChoiceCard
            key={option.id}
            onPress={() => selectRhythm(option.id)}
            option={option}
            selected={draft.rhythm === option.id}
          />
        ))}
      </View>

      {canRemind ? (
        <View
          style={[
            styles.reminderCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
          ]}
        >
          <View style={styles.reminderHeader}>
            <View style={styles.reminderCopy}>
              <AppText style={styles.optionTitle}>{t('onboarding.rhythm.reminderTitle')}</AppText>
              <AppText color="textMuted" style={styles.optionDescription} variant="caption">
                {t('onboarding.rhythm.reminderDescription')}
              </AppText>
            </View>
            <Switch
              accessibilityLabel={t('onboarding.rhythm.reminderTitle')}
              ios_backgroundColor={theme.colors.outline}
              onValueChange={(enabled) =>
                onChange({ ...draft, reminder: { ...draft.reminder, enabled } })
              }
              thumbColor={
                draft.reminder.enabled ? theme.colors.onPrimary : theme.colors.surfaceElevated
              }
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              value={draft.reminder.enabled}
            />
          </View>

          {draft.reminder.enabled ? (
            <View style={styles.timePicker}>
              <TimeButton
                label={t('onboarding.rhythm.earlier')}
                onPress={() => adjustTime(-30)}
                symbol="minus"
              />
              <View style={styles.timeValue}>
                <AppText style={styles.timeText} variant="heading">
                  {String(draft.reminder.hour).padStart(2, '0')}:
                  {String(draft.reminder.minute).padStart(2, '0')}
                </AppText>
                <AppText color="textMuted" variant="caption">
                  {t('onboarding.rhythm.localTime')}
                </AppText>
              </View>
              <TimeButton
                label={t('onboarding.rhythm.later')}
                onPress={() => adjustTime(30)}
                symbol="plus"
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {draft.rhythm ? (
        <InfoNote icon={{ android: 'tips_and_updates', ios: 'lightbulb' }}>
          {t('onboarding.rhythm.feedback')}
        </InfoNote>
      ) : null}
    </View>
  );
}

function TimeButton({ label, onPress, symbol }: { label: string; onPress: () => void; symbol: 'minus' | 'plus' }) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.timeButton,
        { backgroundColor: theme.colors.primarySoft },
        pressed && styles.pressed,
      ]}
    >
      <AppIcon
        name={
          symbol === 'minus'
            ? { android: 'remove', ios: 'minus' }
            : { android: 'add', ios: 'plus' }
        }
        size={21}
        tintColor={theme.colors.primary}
        type="monochrome"
      />
    </Pressable>
  );
}

function AccountStep() {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <View>
      <StepHeader
        descriptionKey="onboarding.account.description"
        titleKey="onboarding.account.title"
      />
      <View
        style={[
          styles.promiseCard,
          { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.outline },
        ]}
      >
        <AppIcon
          name={{ android: 'volunteer_activism', ios: 'heart.circle' }}
          size={26}
          tintColor={theme.colors.primary}
          type="monochrome"
        />
        <View style={styles.promiseCopy}>
          <AppText style={styles.optionTitle}>{t('onboarding.account.promiseTitle')}</AppText>
          <AppText color="textMuted" style={styles.optionDescription} variant="caption">
            {t('onboarding.account.promiseDescription')}
          </AppText>
        </View>
      </View>
      <AccountCard />
      <AppText color="textMuted" style={styles.providerNote} variant="caption">
        {t('onboarding.account.providerNote')}
      </AppText>
    </View>
  );
}

function InfoNote({ children, icon }: { children: ReactNode; icon: AppIconName }) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const copy = typeof children === 'string' && children.startsWith('onboarding.') ? t(children) : children;

  return (
    <View style={[styles.infoNote, { backgroundColor: theme.colors.accentSoft }]}> 
      <AppIcon name={icon} size={20} tintColor={theme.colors.accent} type="monochrome" />
      <AppText style={styles.infoText} variant="caption">
        {copy}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  shell: { flex: 1 },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 8,
  },
  skipLabel: { fontFamily: fonts.sansSemibold },
  progressRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    maxWidth: 720,
    paddingHorizontal: 22,
    paddingVertical: 14,
    width: '100%',
  },
  progressSegment: { borderRadius: 999, flex: 1, height: 4 },
  scrollContent: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 760,
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 8,
    width: '100%',
  },
  card: {
    borderRadius: 30,
    borderWidth: 1,
    minHeight: 480,
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  stepTitle: { fontSize: 38, lineHeight: 43, marginTop: 8 },
  stepDescription: { marginTop: 10 },
  languageCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 28,
    minHeight: 86,
    padding: 15,
  },
  optionList: { gap: 10, marginTop: 24 },
  optionCard: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    padding: 13,
  },
  optionIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  optionCopy: { flex: 1, marginHorizontal: 13 },
  optionTitle: { fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 21 },
  optionDescription: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  radio: { borderRadius: 7, borderWidth: 1, height: 14, width: 14 },
  emotionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 24 },
  emotionChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 46,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  emotionLabel: { fontFamily: fonts.sansSemibold, fontSize: 12 },
  infoNote: {
    alignItems: 'flex-start',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  reminderCard: { borderRadius: 22, borderWidth: 1, marginTop: 18, padding: 16 },
  reminderHeader: { alignItems: 'center', flexDirection: 'row' },
  reminderCopy: { flex: 1, paddingRight: 14 },
  timePicker: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  timeButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  timeValue: { alignItems: 'center' },
  timeText: { fontSize: 30, lineHeight: 34 },
  promiseCard: {
    alignItems: 'flex-start',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 24,
    padding: 16,
  },
  promiseCopy: { flex: 1, marginLeft: 12 },
  providerNote: { fontSize: 12, lineHeight: 18, marginTop: 16, textAlign: 'center' },
  footer: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 58,
    width: 92,
  },
  backPlaceholder: { width: 92 },
  backLabel: { fontFamily: fonts.sansSemibold },
  continueButton: { flex: 1 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
