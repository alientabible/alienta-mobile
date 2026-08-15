import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';

type AppButtonProps = {
  accessibilityHint?: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

export function AppButton({
  accessibilityHint,
  disabled = false,
  label,
  onPress,
}: AppButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.colors.primary },
        disabled && styles.disabled,
        pressed && !disabled && { backgroundColor: theme.colors.primaryPressed },
      ]}
    >
      <AppText color="onPrimary" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontWeight: '800',
    textAlign: 'center',
  },
});
