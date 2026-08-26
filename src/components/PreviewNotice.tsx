import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getSectionPalette, type SectionTone } from '@/theme/tokens';

type PreviewNoticeProps = {
  children: string;
  tone: SectionTone;
};

export function PreviewNotice({ children, tone }: PreviewNoticeProps) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, tone);

  return (
    <View
      accessibilityRole="text"
      style={[styles.notice, { backgroundColor: palette.soft, borderColor: theme.colors.outline }]}
    >
      <SymbolView
        name={{ android: 'info', ios: 'info.circle' }}
        size={18}
        tintColor={palette.accent}
        type="monochrome"
      />
      <AppText color="textMuted" style={styles.text} variant="caption">
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
