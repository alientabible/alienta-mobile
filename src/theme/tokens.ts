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
  shadow: string;
};

export const lightColors: AppColors = {
  background: '#F3EFE6',
  surface: '#FAF7F0',
  surfaceElevated: '#FFFDF8',
  primary: '#214E43',
  primaryPressed: '#173B33',
  primarySoft: '#DCE8E2',
  accent: '#B66F55',
  accentSoft: '#F1DDD3',
  text: '#17221E',
  textMuted: '#66716C',
  outline: '#D8D7CE',
  onPrimary: '#FFFDF7',
  success: '#4F765E',
  shadow: '#10271F',
};

export const darkColors: AppColors = {
  background: '#0B1210',
  surface: '#111A17',
  surfaceElevated: '#18231F',
  primary: '#8BC5AE',
  primaryPressed: '#A8D5C4',
  primarySoft: '#20382F',
  accent: '#DE9A78',
  accentSoft: '#3B2923',
  text: '#F4F0E7',
  textMuted: '#B6C0BA',
  outline: '#31403A',
  onPrimary: '#0C1D17',
  success: '#8BC5AE',
  shadow: '#000000',
};

export type SectionTone = 'home' | 'bible' | 'studies' | 'communities' | 'profile';

export type SectionPalette = {
  accent: string;
  onAccent: string;
  soft: string;
};

const lightSections: Record<SectionTone, SectionPalette> = {
  home: { accent: '#214E43', onAccent: '#FFFDF7', soft: '#DCE8E2' },
  bible: { accent: '#5B725F', onAccent: '#FFFDF7', soft: '#E1E8DC' },
  studies: { accent: '#A65F48', onAccent: '#FFFDF7', soft: '#F2DDD4' },
  communities: { accent: '#607B80', onAccent: '#FFFDF7', soft: '#DEE8E8' },
  profile: { accent: '#746877', onAccent: '#FFFDF7', soft: '#E8E0E8' },
};

const darkSections: Record<SectionTone, SectionPalette> = {
  home: { accent: '#8BC5AE', onAccent: '#0C1D17', soft: '#20382F' },
  bible: { accent: '#A9C19F', onAccent: '#122017', soft: '#293528' },
  studies: { accent: '#DE9A78', onAccent: '#281710', soft: '#3B2923' },
  communities: { accent: '#9DBDC0', onAccent: '#102023', soft: '#233638' },
  profile: { accent: '#C2AFC5', onAccent: '#211923', soft: '#352B36' },
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
  serifItalic: 'CormorantGaramond_500Medium_Italic',
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

export function getSectionPalette(theme: AppTheme, tone: SectionTone): SectionPalette {
  return theme.isDark ? darkSections[tone] : lightSections[tone];
}
