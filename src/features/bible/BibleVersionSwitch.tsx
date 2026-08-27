import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import type { BibleTranslation, BibleVersionId } from '@/features/bible/types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts, getSectionPalette } from '@/theme/tokens';

type BibleVersionSwitchProps = {
  onChange: (versionId: BibleVersionId) => void;
  selectedId: BibleVersionId;
  translations: BibleTranslation[];
};

export function BibleVersionSwitch({
  onChange,
  selectedId,
  translations,
}: BibleVersionSwitchProps) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'bible');

  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
    >
      {translations.map((translation) => {
        const selected = translation.id === selectedId;
        return (
          <Pressable
            accessibilityLabel={translation.displayName}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={translation.id}
            onPress={() => onChange(translation.id)}
            style={({ pressed }) => [
              styles.option,
              selected && { backgroundColor: palette.accent },
              pressed && styles.pressed,
            ]}
          >
            <AppText
              style={[
                styles.label,
                { color: selected ? palette.onAccent : theme.colors.textMuted },
              ]}
            >
              {translation.shortName}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 3,
  },
  option: {
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 40,
    justifyContent: 'center',
    minWidth: 82,
    paddingHorizontal: 14,
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
