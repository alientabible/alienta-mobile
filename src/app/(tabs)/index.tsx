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
import { AppText } from '@/components/AppText';
import { BrandLockup } from '@/components/BrandLockup';
import { FeelingCard } from '@/components/FeelingCard';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts, type AppTheme } from '@/theme/tokens';

type FeelingOption = {
  id: 'peace' | 'grateful' | 'lonely' | 'hopeful';
  icon: {
    android: 'air' | 'favorite_border' | 'person_outline' | 'wb_sunny';
    ios: 'wind' | 'heart' | 'person' | 'sun.max';
  };
  label: string;
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
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
          <BrandLockup />

          <View style={styles.hero}>
            <View style={[styles.eyebrowLine, { backgroundColor: theme.colors.accent }]} />
            <AppText color="accent" style={styles.eyebrow} variant="eyebrow">
              {t('home.eyebrow')}
            </AppText>
            <AppText accessibilityRole="header" style={styles.title} variant="hero">
              {t('home.title')}
            </AppText>
            <AppText color="textMuted" style={styles.subtitle}>
              {t('home.subtitle')}
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
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
                shadowColor: theme.colors.text,
              },
            ]}
          >
            <AppText style={styles.inputLabel}>{t('home.inputLabel')}</AppText>
            <TextInput
              accessibilityLabel={t('home.inputAccessibility')}
              maxLength={240}
              multiline
              onChangeText={setNote}
              onSubmitEditing={handleContinue}
              placeholder={t('home.inputPlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.accent}
              style={[styles.input, { color: theme.colors.text }]}
              textAlignVertical="top"
              value={note}
            />
            <View style={[styles.inputRule, { backgroundColor: theme.colors.outline }]} />
            <AppText color="textMuted" style={styles.characterCount} variant="caption">
              {note.length}/240
            </AppText>
          </View>

          <View style={styles.buttonSpacing}>
            <AppButton
              accessibilityHint={t('home.continueHint')}
              disabled={!canContinue}
              icon={{ android: 'arrow_forward', ios: 'arrow.right' }}
              label={t('home.continue')}
              onPress={handleContinue}
            />
          </View>

          <View style={styles.privacyNote}>
            <View style={[styles.privacyDot, { backgroundColor: theme.colors.accent }]} />
            <AppText color="textMuted" style={styles.privacyText} variant="caption">
              {t('home.privacy')}
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      paddingBottom: 28,
      paddingHorizontal: 22,
      paddingTop: 14,
    },
    hero: {
      alignItems: 'center',
      marginTop: 24,
    },
    eyebrowLine: {
      borderRadius: 2,
      height: 2,
      marginBottom: 14,
      width: 34,
    },
    eyebrow: {
      fontSize: 12,
      textAlign: 'center',
    },
    title: {
      color: theme.colors.primary,
      marginTop: 9,
      maxWidth: 340,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      marginTop: 9,
      maxWidth: 345,
      textAlign: 'center',
    },
    feelingGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 22,
    },
    halfCard: {
      flexBasis: '47%',
      flexGrow: 1,
    },
    fullCard: {
      flexBasis: '100%',
    },
    inputCard: {
      borderRadius: 24,
      borderWidth: 1,
      elevation: 1,
      marginTop: 14,
      minHeight: 132,
      paddingHorizontal: 18,
      paddingTop: 17,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
    },
    inputLabel: {
      fontFamily: fonts.sansSemibold,
      fontSize: 15,
    },
    input: {
      flex: 1,
      fontFamily: fonts.sansRegular,
      fontSize: 16,
      lineHeight: 24,
      minHeight: 70,
      paddingHorizontal: 0,
      paddingTop: 8,
    },
    inputRule: {
      height: StyleSheet.hairlineWidth,
    },
    characterCount: {
      alignSelf: 'flex-end',
      fontSize: 12,
      paddingBottom: 9,
      paddingTop: 5,
    },
    buttonSpacing: {
      marginTop: 14,
    },
    privacyNote: {
      alignItems: 'center',
      alignSelf: 'center',
      flexDirection: 'row',
      gap: 9,
      marginTop: 14,
      maxWidth: 320,
    },
    privacyDot: {
      borderRadius: 3,
      height: 6,
      width: 6,
    },
    privacyText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
