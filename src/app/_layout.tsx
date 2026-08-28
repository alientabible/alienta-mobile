import '@/i18n';

import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { CormorantGaramond_500Medium_Italic } from '@expo-google-fonts/cormorant-garamond/500Medium_Italic';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BibleDatabaseProvider } from '@/features/bible/BibleDatabaseProvider';
import { ThemeProvider, useAppTheme } from '@/theme/ThemeProvider';

void SplashScreen.preventAutoHideAsync();

const bibleRouteOptions = {
  animation: 'slide_from_right' as const,
  gestureEnabled: true,
  presentation: 'card' as const,
};

function RootNavigator() {
  const theme = useAppTheme();

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="bible/reader" options={bibleRouteOptions} />
        <Stack.Screen name="bible/search" options={bibleRouteOptions} />
        <Stack.Screen name="bible/sources" options={bibleRouteOptions} />
        <Stack.Screen name="reflection/[id]" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [databaseReady, setDatabaseReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && databaseReady) {
      void SplashScreen.hideAsync();
    }
  }, [databaseReady, fontError, fontsLoaded]);

  const handleDatabaseReady = useCallback(() => setDatabaseReady(true), []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <BibleDatabaseProvider onReady={handleDatabaseReady}>
          <RootNavigator />
        </BibleDatabaseProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
