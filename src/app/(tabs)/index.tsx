import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { FeelingChip } from '@/components/feeling-chip';
import { useAppTheme } from '@/theme/ThemeProvider';
import type { AppTheme } from '@/theme/tokens';

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [feeling, setFeeling] = useState('');
  const canContinue = feeling.trim().length > 0;
  const suggestedFeelings = [
    t('home.suggestions.peace'),
    t('home.suggestions.grateful'),
    t('home.suggestions.lonely'),
    t('home.suggestions.hopeful'),
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
          <View style={styles.brandRow}>
            <View accessibilityElementsHidden style={styles.brandMark}>
              <AppText color="onPrimary" style={styles.brandLetter}>
                A
              </AppText>
            </View>
            <AppText accessibilityRole="header" style={styles.brandName}>
              {t('home.brand')}
            </AppText>
          </View>

          <View style={styles.hero}>
            <AppText color="primary" variant="eyebrow">
              {t('home.eyebrow')}
            </AppText>
            <AppText accessibilityRole="header" style={styles.title} variant="hero">
              {t('home.title')}
            </AppText>
            <AppText color="textMuted" style={styles.subtitle}>
              {t('home.subtitle')}
            </AppText>
          </View>

          <View style={styles.card}>
            <AppText style={styles.inputLabel}>{t('home.inputLabel')}</AppText>
            <TextInput
              accessibilityLabel={t('home.inputAccessibility')}
              maxLength={240}
              multiline
              onChangeText={setFeeling}
              onSubmitEditing={handleContinue}
              placeholder={t('home.inputPlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.primary}
              style={styles.input}
              textAlignVertical="top"
              value={feeling}
            />

            <View style={styles.buttonSpacing}>
              <AppButton
                accessibilityHint={t('home.continueHint')}
                disabled={!canContinue}
                label={t('home.continue')}
                onPress={handleContinue}
              />
            </View>
          </View>

          <View style={styles.suggestions}>
            <AppText style={styles.sectionTitle}>{t('home.suggestionsTitle')}</AppText>
            <View style={styles.chipGroup}>
              {suggestedFeelings.map((item) => (
                <FeelingChip
                  key={item}
                  label={item}
                  onPress={() => setFeeling(item)}
                  selected={feeling === item}
                />
              ))}
            </View>
          </View>

          <View style={styles.privacyNote}>
            <AppText color="primary" style={styles.privacySymbol}>
              ✓
            </AppText>
            <AppText style={styles.privacyText}>{t('home.privacy')}</AppText>
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
      paddingHorizontal: 24,
      paddingTop: 18,
      paddingBottom: 32,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    brandMark: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 19,
      backgroundColor: theme.colors.primary,
    },
    brandLetter: {
      fontSize: 21,
      fontWeight: '900',
    },
    brandName: {
      fontSize: 21,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    hero: {
      marginTop: 48,
    },
    title: {
      marginTop: 10,
    },
    subtitle: {
      marginTop: 14,
    },
    card: {
      marginTop: 30,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      padding: 20,
    },
    inputLabel: {
      fontWeight: '700',
    },
    input: {
      minHeight: 112,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontSize: 17,
      lineHeight: 25,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    buttonSpacing: {
      marginTop: 16,
    },
    suggestions: {
      marginTop: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    chipGroup: {
      marginTop: 14,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    privacyNote: {
      marginTop: 28,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      borderRadius: 16,
      backgroundColor: theme.colors.primarySoft,
      padding: 16,
    },
    privacySymbol: {
      fontWeight: '900',
    },
    privacyText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
    },
  });
}
