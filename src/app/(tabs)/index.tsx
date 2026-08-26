import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/AppButton';
import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { BrandLockup } from '@/components/BrandLockup';
import { FeelingCard } from '@/components/FeelingCard';
import { PreviewNotice } from '@/components/PreviewNotice';
import { ScreenReveal } from '@/components/ScreenReveal';
import { ThemeQuickToggle } from '@/components/ThemeQuickToggle';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette, type AppTheme } from '@/theme/tokens';

type FeelingOption = {
  id: 'peace' | 'grateful' | 'lonely' | 'hopeful';
  icon: AppIconName;
  label: string;
};

type RitualStep = {
  icon: AppIconName;
  label: string;
  number: string;
  supportingText: string;
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'home');
  const { fontScale, width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingOption['id'] | null>(null);
  const [note, setNote] = useState('');
  const useSingleColumn = width < 360 || fontScale > 1.35;
  const canContinue = selectedFeeling !== null || note.trim().length > 0;

  const feelings: FeelingOption[] = [
    {
      id: 'peace',
      icon: { android: 'air', ios: 'wind' },
      label: t('home.suggestions.peace'),
    },
    {
      id: 'grateful',
      icon: { android: 'favorite_border', ios: 'heart' },
      label: t('home.suggestions.grateful'),
    },
    {
      id: 'lonely',
      icon: { android: 'person_outline', ios: 'person' },
      label: t('home.suggestions.lonely'),
    },
    {
      id: 'hopeful',
      icon: { android: 'wb_sunny', ios: 'sun.max' },
      label: t('home.suggestions.hopeful'),
    },
  ];

  const ritualSteps: RitualStep[] = [
    {
      icon: { android: 'menu_book', ios: 'book' },
      label: t('home.ritual.read.title'),
      number: '01',
      supportingText: t('home.ritual.read.description'),
    },
    {
      icon: { android: 'volunteer_activism', ios: 'hands.sparkles' },
      label: t('home.ritual.pray.title'),
      number: '02',
      supportingText: t('home.ritual.pray.description'),
    },
    {
      icon: { android: 'spa', ios: 'leaf' },
      label: t('home.ritual.reflect.title'),
      number: '03',
      supportingText: t('home.ritual.reflect.description'),
    },
  ];

  const handleContinue = () => {
    if (!canContinue) return;
    Alert.alert(t('home.thanksTitle'), t('home.thanksMessage'));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenReveal>
          <View style={styles.topBar}>
            <BrandLockup />
            <ThemeQuickToggle />
          </View>

          <View style={[styles.heroDepth, getPremiumDepth(theme, 'floating')]}>
            <View
            style={[
              styles.hero,
              {
                backgroundColor: palette.soft,
                borderColor: theme.colors.outline,
              },
            ]}
            >
              <View
                accessibilityElementsHidden
                style={[styles.heroRing, { borderColor: palette.accent }]}
              />
              <View
                accessibilityElementsHidden
                style={[styles.heroOrb, { backgroundColor: palette.accent }]}
              />
              <AppText style={[styles.eyebrow, { color: palette.accent }]} variant="eyebrow">
                {t('home.eyebrow')}
              </AppText>
              <AppText accessibilityRole="header" style={styles.title} variant="hero">
                {t('home.title')}
              </AppText>
              <AppText
                style={[styles.titleAccent, { color: palette.accent }]}
                variant="heroItalic"
              >
                {t('home.titleAccent')}
              </AppText>
              <View style={[styles.heroRule, { backgroundColor: palette.accent }]} />
              <AppText color="textMuted" style={styles.subtitle}>
                {t('home.subtitle')}
              </AppText>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <AppText accessibilityRole="header" variant="heading">
              {t('home.feelingsTitle')}
            </AppText>
            <AppText color="textMuted" style={styles.sectionDescription} variant="caption">
              {t('home.feelingsDescription')}
            </AppText>
          </View>

          <View accessibilityRole="radiogroup" style={styles.feelingGrid}>
            {feelings.map((item) => (
              <FeelingCard
                icon={item.icon}
                key={item.id}
                label={item.label}
                onPress={() =>
                  setSelectedFeeling((current) => (current === item.id ? null : item.id))
                }
                selected={selectedFeeling === item.id}
                style={useSingleColumn ? styles.fullCard : styles.halfCard}
              />
            ))}
          </View>

          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.outline,
              },
              getPremiumDepth(theme, 'raised'),
            ]}
          >
            <View style={styles.inputHeader}>
              <AppText style={styles.inputLabel}>{t('home.inputLabel')}</AppText>
              <AppText color="textMuted" style={styles.characterCount} variant="caption">
                {note.length}/240
              </AppText>
            </View>
            <TextInput
              accessibilityLabel={t('home.inputAccessibility')}
              maxLength={240}
              multiline
              onChangeText={setNote}
              onSubmitEditing={handleContinue}
              placeholder={t('home.inputPlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={palette.accent}
              style={[
                styles.input,
                { backgroundColor: theme.colors.surface, color: theme.colors.text },
              ]}
              textAlignVertical="top"
              value={note}
            />
            <AppButton
              accessibilityHint={t('home.continueHint')}
              disabled={!canContinue}
              icon={{ android: 'arrow_forward', ios: 'arrow.right' }}
              label={t('home.continue')}
              onPress={handleContinue}
            />
          </View>

          <PreviewNotice tone="home">{t('home.privacy')}</PreviewNotice>

          <View style={styles.ritualHeading}>
            <AppText color="accent" variant="eyebrow">
              {t('home.ritual.eyebrow')}
            </AppText>
            <AppText accessibilityRole="header" style={styles.ritualTitle} variant="heading">
              {t('home.ritual.title')}
            </AppText>
          </View>

          <View style={styles.ritualList}>
            {ritualSteps.map((step) => (
              <View
                key={step.number}
                style={[
                  styles.ritualCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outline,
                  },
                  getPremiumDepth(theme, 'soft'),
                ]}
              >
                <AppText style={[styles.stepNumber, { color: palette.accent }]} variant="caption">
                  {step.number}
                </AppText>
                <View style={[styles.ritualIcon, { backgroundColor: palette.soft }]}>
                  <AppIcon
                    name={step.icon}
                    size={22}
                    tintColor={palette.accent}
                    type="monochrome"
                  />
                </View>
                <View style={styles.ritualCopy}>
                  <AppText style={styles.ritualLabel} variant="serifBody">
                    {step.label}
                  </AppText>
                  <AppText color="textMuted" style={styles.ritualDescription} variant="caption">
                    {step.supportingText}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
          </ScreenReveal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      alignSelf: 'center',
      maxWidth: 720,
      paddingBottom: 38,
      paddingHorizontal: 20,
      paddingTop: 12,
      width: '100%',
    },
    topBar: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    heroDepth: {
      borderRadius: 32,
      marginTop: 22,
    },
    hero: {
      borderRadius: 32,
      borderWidth: StyleSheet.hairlineWidth,
      minHeight: 344,
      overflow: 'hidden',
      padding: 24,
    },
    heroRing: {
      borderRadius: 105,
      borderWidth: 1,
      height: 210,
      opacity: 0.18,
      position: 'absolute',
      right: -72,
      top: -45,
      width: 210,
    },
    heroOrb: {
      borderRadius: 42,
      height: 84,
      opacity: 0.09,
      position: 'absolute',
      right: 32,
      top: 45,
      width: 84,
    },
    eyebrow: {
      fontSize: 12,
      marginTop: 24,
    },
    title: {
      fontSize: 47,
      lineHeight: 48,
      marginTop: 18,
      maxWidth: 360,
    },
    titleAccent: {
      fontSize: 47,
      lineHeight: 48,
      marginTop: -2,
    },
    heroRule: {
      borderRadius: 2,
      height: 2,
      marginTop: 22,
      width: 42,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      marginTop: 15,
      maxWidth: 330,
    },
    sectionHeading: {
      marginTop: 34,
    },
    sectionDescription: {
      marginTop: 4,
    },
    feelingGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 18,
    },
    halfCard: {
      flexBasis: '47%',
      flexGrow: 1,
    },
    fullCard: {
      flexBasis: '100%',
    },
    inputCard: {
      borderRadius: 26,
      borderWidth: 1,
      gap: 14,
      marginTop: 16,
      padding: 18,
    },
    inputHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    inputLabel: {
      fontFamily: fonts.sansSemibold,
      fontSize: 15,
    },
    characterCount: {
      fontSize: 12,
    },
    input: {
      borderRadius: 18,
      fontFamily: fonts.sansRegular,
      fontSize: 16,
      lineHeight: 24,
      minHeight: 116,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    ritualHeading: {
      marginTop: 38,
    },
    ritualTitle: {
      marginTop: 6,
    },
    ritualList: {
      gap: 10,
      marginTop: 16,
    },
    ritualCard: {
      alignItems: 'center',
      borderRadius: 22,
      borderWidth: 1,
      flexDirection: 'row',
      minHeight: 94,
      padding: 14,
    },
    stepNumber: {
      fontFamily: fonts.sansBold,
      fontSize: 11,
      marginRight: 10,
    },
    ritualIcon: {
      alignItems: 'center',
      borderRadius: 20,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    ritualCopy: {
      flex: 1,
      marginLeft: 13,
    },
    ritualLabel: {
      fontFamily: fonts.serifSemibold,
      fontSize: 23,
      lineHeight: 26,
    },
    ritualDescription: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 2,
    },
  });
}
