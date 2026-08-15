export type AppColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  accent: string;
  text: string;
  textMuted: string;
  outline: string;
  onPrimary: string;
  success: string;
};

export const lightColors: AppColors = {
  background: '#F8F7F2',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  primary: '#185A45',
  primaryPressed: '#0F4635',
  primarySoft: '#E8F2ED',
  accent: '#B27A18',
  text: '#17241F',
  textMuted: '#65736B',
  outline: '#DCE4DF',
  onPrimary: '#FFFFFF',
  success: '#237A57',
};

export const darkColors: AppColors = {
  background: '#101713',
  surface: '#18211D',
  surfaceElevated: '#202B26',
  primary: '#75C9A7',
  primaryPressed: '#9EDDBF',
  primarySoft: '#203D32',
  accent: '#E2B861',
  text: '#F1F5F2',
  textMuted: '#B1BDB6',
  outline: '#35463E',
  onPrimary: '#0E2B20',
  success: '#75C9A7',
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
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const typography = {
  body: 17,
  bodyLineHeight: 26,
  caption: 14,
  heading: 24,
  hero: 38,
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
    typography,
    accessibility,
  };
}
