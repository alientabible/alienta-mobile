import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

type AppButtonProps = {
  accessibilityHint?: string;
  disabled?: boolean;
  icon?: SymbolViewProps['name'];
  label: string;
  onPress: () => void;
};

export function AppButton({
  accessibilityHint,
  disabled = false,
  icon,
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
        disabled && {
          backgroundColor: theme.colors.primarySoft,
          borderColor: theme.colors.outline,
          borderWidth: 1,
        },
        pressed && !disabled && {
          backgroundColor: theme.colors.primaryPressed,
          transform: [{ scale: 0.985 }],
        },
      ]}
    >
      <View style={styles.content}>
        <AppText color={disabled ? 'textMuted' : 'onPrimary'} style={styles.label}>
          {label}
        </AppText>
        {icon ? (
          <SymbolView
            name={icon}
            size={20}
            tintColor={disabled ? theme.colors.textMuted : theme.colors.onPrimary}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.sansBold,
    textAlign: 'center',
  },
});
