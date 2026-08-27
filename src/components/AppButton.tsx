import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

type AppButtonProps = {
  accessibilityHint?: string;
  disabled?: boolean;
  icon?: AppIconName;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export function AppButton({
  accessibilityHint,
  disabled = false,
  icon,
  label,
  onPress,
  variant = 'primary',
}: AppButtonProps) {
  const theme = useAppTheme();
  const isSecondary = variant === 'secondary';
  const foregroundColor = disabled
    ? theme.colors.textMuted
    : isSecondary
      ? theme.colors.primary
      : theme.colors.onPrimary;

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
        isSecondary
          ? {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.primary,
              borderWidth: 1,
            }
          : { backgroundColor: theme.colors.primary },
        disabled && {
          backgroundColor: theme.colors.primarySoft,
          borderColor: theme.colors.outline,
          borderWidth: 1,
        },
        pressed && !disabled && {
          backgroundColor: isSecondary ? theme.colors.primarySoft : theme.colors.primaryPressed,
          transform: [{ scale: 0.985 }],
        },
      ]}
    >
      <View style={styles.content}>
        <AppText style={[styles.label, { color: foregroundColor }]}>
          {label}
        </AppText>
        {icon ? (
          <AppIcon
            name={icon}
            size={20}
            tintColor={foregroundColor}
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
