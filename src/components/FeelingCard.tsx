import { useEffect, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native';

import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts } from '@/theme/tokens';

type FeelingCardProps = {
  icon: AppIconName;
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
  const reduceMotion = useReducedMotionPreference();
  const [selection] = useState(() => new Animated.Value(selected ? 1 : 0));

  useEffect(() => {
    const destination = selected ? 1 : 0;
    selection.stopAnimation();

    if (reduceMotion) {
      selection.setValue(destination);
      return undefined;
    }

    const selectionSpring = Animated.spring(selection, {
      toValue: destination,
      damping: 18,
      stiffness: 210,
      mass: 1,
      useNativeDriver: Platform.OS !== 'web',
    });
    selectionSpring.start();

    return () => selectionSpring.stop();
  }, [reduceMotion, selected, selection]);

  const animatedStyle = {
    transform: [
      {
        scale: selection.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.018],
        }),
      },
    ],
  };

  return (
    <Animated.View
      style={[
        styles.depthLayer,
        style,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
        },
        getPremiumDepth(theme, selected ? 'raised' : 'soft'),
        animatedStyle,
      ]}
    >
      <Pressable
        accessibilityLabel={`Seleccionar sentimiento: ${label}`}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
            borderColor: selected ? theme.colors.primary : theme.colors.outline,
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
          <AppIcon
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  depthLayer: {
    borderRadius: 24,
  },
  card: {
    minHeight: 118,
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'space-between',
    padding: 14,
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
