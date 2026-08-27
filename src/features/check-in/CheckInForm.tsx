import { useState } from 'react';
import { StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

import { EmotionPicker } from './EmotionPicker';
import type { CheckInInput, EmotionId } from './types';

type CheckInFormProps = {
  onSubmit: (input: CheckInInput) => void;
};

export function CheckInForm({ onSubmit }: CheckInFormProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'home');
  const styles = checkInStyles;
  const { fontScale, width } = useWindowDimensions();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionId | null>(null);
  const [note, setNote] = useState('');
  const canContinue = selectedEmotion !== null || note.trim().length > 0;
  const useSingleColumn = width < 360 || fontScale > 1.35;

  const handleSubmit = () => {
    if (!canContinue) return;

    onSubmit({ emotion: selectedEmotion, note: note.trim() });

    // El texto sensible vive solo en memoria y se descarta tras clasificarlo.
    setSelectedEmotion(null);
    setNote('');
  };

  return (
    <>
      <EmotionPicker
        onChange={setSelectedEmotion}
        selectedEmotion={selectedEmotion}
        useSingleColumn={useSingleColumn}
      />

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
          onSubmitEditing={handleSubmit}
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
          onPress={handleSubmit}
        />
      </View>
    </>
  );
}

const checkInStyles = StyleSheet.create({
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
});
