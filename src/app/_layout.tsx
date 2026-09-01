import '@/i18n';

import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { CormorantGaramond_500Medium_Italic } from '@expo-google-fonts/cormorant-garamond/500Medium_Italic';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BrandLockup } from '@/components/BrandLockup';
import { AuthProvider } from '@/core/auth/AuthProvider';
import { BibleDatabaseProvider } from '@/features/bible/BibleDatabaseProvider';
import { BibleSyncProvider } from '@/features/bible/BibleSyncProvider';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';
import {
  OnboardingProvider,
  useOnboarding,
} from '@/features/onboarding/OnboardingProvider';
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
        <Stack.Screen name="share" options={bibleRouteOptions} />
        <Stack.Screen name="auth/callback" options={{ animation: 'fade', presentation: 'card' }} />
      </Stack>
    </>
  );
}

function DatabaseBackedApp() {
  const theme = useAppTheme();

  return (
    <View style={[styles.databaseShell, { backgroundColor: theme.colors.background }]}>
      <View style={styles.databaseLoading}>
        <BrandLockup />
        <ActivityIndicator color={theme.colors.primary} size="small" />
      </View>
      <View style={styles.databaseNavigator}>
        <BibleDatabaseProvider>
          <BibleSyncProvider>
            <RootNavigator />
          </BibleSyncProvider>
        </BibleDatabaseProvider>
      </View>
    </View>
  );
}

function AppGate({ fontsReady }: { fontsReady: boolean }) {
  const { completed, ready } = useOnboarding();
  const pathname = usePathname();

  useEffect(() => {
    if (fontsReady && ready) {
      void SplashScreen.hideAsync();
    }
  }, [fontsReady, ready]);

  if (!fontsReady || !ready) return null;
  if (pathname.startsWith('/auth/')) return <RootNavigator />;
  return completed ? <DatabaseBackedApp /> : <OnboardingFlow />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const fontsReady = fontsLoaded || Boolean(fontError);

  if (!fontsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <OnboardingProvider>
            <AppGate fontsReady={fontsReady} />
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  databaseLoading: {
    alignItems: 'center',
    bottom: 0,
    gap: 22,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  databaseNavigator: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  databaseShell: {
    flex: 1,
  },
});
