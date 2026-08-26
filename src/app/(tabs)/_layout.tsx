import { Tabs } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
  name: SymbolViewProps['name'];
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
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.05,
          shadowRadius: 18,
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
