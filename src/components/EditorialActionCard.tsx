import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts, getSectionPalette, type SectionTone } from '@/theme/tokens';

type EditorialActionCardProps = {
  description: string;
  icon: SymbolViewProps['name'];
  meta?: string;
  title: string;
  tone: SectionTone;
};

export function EditorialActionCard({
  description,
  icon,
  meta,
  title,
  tone,
}: EditorialActionCardProps) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, tone);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.outline,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <View style={[styles.iconWell, { backgroundColor: palette.soft }]}>
        <SymbolView name={icon} size={23} tintColor={palette.accent} type="monochrome" />
      </View>
      <View style={styles.copy}>
        {meta ? (
          <AppText style={[styles.meta, { color: palette.accent }]} variant="eyebrow">
            {meta}
          </AppText>
        ) : null}
        <AppText style={styles.title} variant="serifBody">
          {title}
        </AppText>
        <AppText color="textMuted" style={styles.description} variant="caption">
          {description}
        </AppText>
      </View>
      <SymbolView
        name={{ android: 'arrow_forward', ios: 'arrow.right' }}
        size={18}
        tintColor={theme.colors.textMuted}
        type="monochrome"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    elevation: 1,
    flexDirection: 'row',
    minHeight: 112,
    padding: 15,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 22,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  copy: {
    flex: 1,
    marginHorizontal: 14,
  },
  meta: {
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.serifSemibold,
    fontSize: 23,
    lineHeight: 27,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
});
