import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

type FeelingCardProps = {
  icon: SymbolViewProps['name'];
  label: string;
  onPress: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function FeelingCard({
  icon,
  label,
  onPress,
  selected = false,
  style,
}: FeelingCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={`Seleccionar sentimiento: ${label}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        style,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          shadowColor: theme.colors.text,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.iconWell,
          { backgroundColor: selected ? theme.colors.accentSoft : theme.colors.primarySoft },
        ]}
      >
        <SymbolView
          name={icon}
          size={25}
          tintColor={selected ? theme.colors.accent : theme.colors.primary}
          type="monochrome"
        />
      </View>
      <AppText style={styles.label}>{label}</AppText>
      <View
        accessibilityElementsHidden
        style={[
          styles.selectionDot,
          {
            backgroundColor: selected ? theme.colors.accent : 'transparent',
            borderColor: selected ? theme.colors.accent : theme.colors.outline,
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 118,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 1,
    justifyContent: 'space-between',
    padding: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  label: {
    fontFamily: fonts.sansSemibold,
    fontSize: 15,
    lineHeight: 21,
    paddingRight: 18,
  },
  selectionDot: {
    borderRadius: 5,
    borderWidth: 1,
    bottom: 15,
    height: 10,
    position: 'absolute',
    right: 14,
    width: 10,
  },
});
