import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

type FeelingChipProps = {
  label: string;
  onPress: () => void;
  selected?: boolean;
};

export function FeelingChip({ label, onPress, selected = false }: FeelingChipProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={`Seleccionar sentimiento: ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
        },
        pressed && { backgroundColor: theme.colors.primarySoft },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? theme.colors.primary : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
