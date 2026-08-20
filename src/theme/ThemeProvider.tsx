import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { type AppTheme, createAppTheme } from '@/theme/tokens';

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const theme = useMemo(
    () => createAppTheme(systemColorScheme === 'dark' ? 'dark' : 'light'),
    [systemColorScheme],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }

  return theme;
}
