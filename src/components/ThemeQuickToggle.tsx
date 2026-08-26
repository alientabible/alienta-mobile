import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

export function ThemeQuickToggle() {
  const theme = useAppTheme();
  const nextMode = theme.isDark ? 'light' : 'dark';

  return (
    <Pressable
      accessibilityHint="Alterna entre la apariencia clara y oscura"
      accessibilityLabel={theme.isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      accessibilityRole="button"
      onPress={() => theme.setMode(nextMode)}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
        pressed && styles.pressed,
      ]}
    >
      <SymbolView
        name={
          theme.isDark
            ? { android: 'light_mode', ios: 'sun.max' }
            : { android: 'dark_mode', ios: 'moon' }
        }
        size={21}
        tintColor={theme.colors.text}
        type="monochrome"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
