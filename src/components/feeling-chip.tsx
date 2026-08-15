import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';

type FeelingChipProps = {
  label: string;
  onPress: () => void;
};

export function FeelingChip({ label, onPress }: FeelingChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Seleccionar sentimiento: ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 24,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  chipPressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  label: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
  },
});
