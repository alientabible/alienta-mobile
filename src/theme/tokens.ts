export type AppColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  outline: string;
  onPrimary: string;
  success: string;
};

export const lightColors: AppColors = {
  background: '#F4EEE4',
  surface: '#FBF8F2',
  surfaceElevated: '#FFFFFF',
  primary: '#173C33',
  primaryPressed: '#0E2B25',
  primarySoft: '#E5ECE7',
  accent: '#865D22',
  accentSoft: '#F0E2C9',
  text: '#1F2420',
  textMuted: '#5F675F',
  outline: '#D8CFC1',
  onPrimary: '#FBF8F2',
  success: '#2D6B52',
};

export const darkColors: AppColors = {
  background: '#0E1412',
  surface: '#161D1A',
  surfaceElevated: '#202823',
  primary: '#92C1AC',
  primaryPressed: '#B1D4C4',
  primarySoft: '#22372F',
  accent: '#E0B86B',
  accentSoft: '#3A3021',
  text: '#F4EEE4',
  textMuted: '#C0B8AC',
  outline: '#3B443F',
  onPrimary: '#10231C',
  success: '#92C1AC',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  hero: 48,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999,
} as const;

export const fonts = {
  sansRegular: 'Manrope_400Regular',
  sansSemibold: 'Manrope_600SemiBold',
  sansBold: 'Manrope_700Bold',
  serifMedium: 'CormorantGaramond_500Medium',
  serifSemibold: 'CormorantGaramond_600SemiBold',
} as const;

export const typography = {
  body: 17,
  bodyLineHeight: 26,
  caption: 14,
  heading: 30,
  hero: 46,
} as const;

export const accessibility = {
  minimumTouchTarget: 48,
} as const;

export type AppTheme = {
  colors: AppColors;
  colorScheme: 'light' | 'dark';
  isDark: boolean;
  spacing: typeof spacing;
  radii: typeof radii;
  fonts: typeof fonts;
  typography: typeof typography;
  accessibility: typeof accessibility;
};

export function createAppTheme(colorScheme: 'light' | 'dark'): AppTheme {
  return {
    colors: colorScheme === 'dark' ? darkColors : lightColors,
    colorScheme,
    isDark: colorScheme === 'dark',
    spacing,
    radii,
    fonts,
    typography,
    accessibility,
  };
}
