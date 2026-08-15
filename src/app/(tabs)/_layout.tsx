import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
  name: {
    android: 'home' | 'menu_book' | 'school' | 'groups' | 'person';
    ios: 'house.fill' | 'book.fill' | 'graduationcap.fill' | 'person.3.fill' | 'person.crop.circle.fill';
  };
};

function TabIcon({ color, focused, name }: TabIconProps) {
  return (
    <SymbolView
      name={name}
      size={focused ? 25 : 23}
      tintColor={color}
      type="monochrome"
    />
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarStyle: {
          minHeight: 68,
          borderTopColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
          paddingTop: 7,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarAccessibilityLabel: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ android: 'home', ios: 'house.fill' }} />
          ),
          title: t('tabs.home'),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          tabBarAccessibilityLabel: t('tabs.bible'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ android: 'menu_book', ios: 'book.fill' }} />
          ),
          title: t('tabs.bible'),
        }}
      />
      <Tabs.Screen
        name="studies"
        options={{
          tabBarAccessibilityLabel: t('tabs.studies'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ android: 'school', ios: 'graduationcap.fill' }} />
          ),
          title: t('tabs.studies'),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          tabBarAccessibilityLabel: t('tabs.communities'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ android: 'groups', ios: 'person.3.fill' }} />
          ),
          title: t('tabs.communities'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarAccessibilityLabel: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ android: 'person', ios: 'person.crop.circle.fill' }} />
          ),
          title: t('tabs.profile'),
        }}
      />
    </Tabs>
  );
}
