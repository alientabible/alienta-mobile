import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FeelingCard } from '@/components/FeelingCard';

import { emotionOptions } from './emotions';
import type { EmotionId } from './types';

type EmotionPickerProps = {
  onChange: (emotion: EmotionId | null) => void;
  selectedEmotion: EmotionId | null;
  useSingleColumn: boolean;
};

export function EmotionPicker({
  onChange,
  selectedEmotion,
  useSingleColumn,
}: EmotionPickerProps) {
  const { t } = useTranslation();

  return (
    <View accessibilityRole="radiogroup" style={styles.grid}>
      {emotionOptions.map((emotion) => (
        <FeelingCard
          icon={emotion.icon}
          key={emotion.id}
          label={t(emotion.labelKey)}
          onPress={() => onChange(selectedEmotion === emotion.id ? null : emotion.id)}
          selected={selectedEmotion === emotion.id}
          style={useSingleColumn ? styles.fullCard : styles.halfCard}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
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
});
