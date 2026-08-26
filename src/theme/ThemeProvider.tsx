import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { type AppTheme, createAppTheme } from '@/theme/tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = AppTheme & {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const effectiveScheme = mode === 'system' ? systemColorScheme : mode;
  const theme = useMemo<ThemeContextValue>(() => {
    const appTheme = createAppTheme(effectiveScheme === 'dark' ? 'dark' : 'light');

    return { ...appTheme, mode, setMode };
  }, [effectiveScheme, mode]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }

  return theme;
}
