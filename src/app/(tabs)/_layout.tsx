import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Platform, StyleSheet, type ColorValue } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts } from '@/theme/tokens';

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
  name: AppIconName;
};

function TabIcon({ color, focused, name }: TabIconProps) {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotionPreference();
  const [focus] = useState(() => new Animated.Value(focused ? 1 : 0));

  useEffect(() => {
    const destination = focused ? 1 : 0;
    focus.stopAnimation();

    if (reduceMotion) {
      focus.setValue(destination);
      return undefined;
    }

    const focusSpring = Animated.spring(focus, {
      toValue: destination,
      damping: 17,
      stiffness: 240,
      mass: 1,
      useNativeDriver: Platform.OS !== 'web',
    });
    focusSpring.start();

    return () => focusSpring.stop();
  }, [focus, focused, reduceMotion]);

  const animatedStyle = {
    opacity: focus.interpolate({
      inputRange: [0, 1],
      outputRange: [0.78, 1],
    }),
    transform: [
      {
        scale: focus.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1.06],
        }),
      },
    ],
  };

  return (
    <Animated.View
      style={[
        styles.tabIcon,
        { backgroundColor: focused ? theme.colors.accentSoft : 'transparent' },
        animatedStyle,
      ]}
    >
      <AppIcon name={name} size={22} tintColor={color} type="monochrome" />
    </Animated.View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarAllowFontScaling: false,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.sansSemibold,
          fontSize: 12,
        },
        tabBarStyle: {
          minHeight: 76,
          borderTopColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
          paddingBottom: 7,
          paddingTop: 8,
          ...getPremiumDepth(theme, 'raised'),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarAccessibilityLabel: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ android: 'home', ios: 'house' }} />
          ),
          title: t('tabs.home'),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          tabBarAccessibilityLabel: t('tabs.bible'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ android: 'menu_book', ios: 'book' }} />
          ),
          title: t('tabs.bible'),
        }}
      />
      <Tabs.Screen
        name="studies"
        options={{
          tabBarAccessibilityLabel: t('tabs.studies'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ android: 'school', ios: 'graduationcap' }} />
          ),
          title: t('tabs.studies'),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          tabBarAccessibilityLabel: t('tabs.communities'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ android: 'groups', ios: 'person.3' }} />
          ),
          title: t('tabs.communities'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarAccessibilityLabel: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ android: 'person', ios: 'person.crop.circle' }} />
          ),
          title: t('tabs.profile'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 38,
  },
});
