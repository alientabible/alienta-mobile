import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

export function BrandLockup() {
  const theme = useAppTheme();

  return (
    <View accessibilityLabel="Alienta" accessibilityRole="header" style={styles.lockup}>
      <AppText importantForAccessibility="no" style={styles.wordmark}>
        Alienta
      </AppText>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.mark}>
        <View style={[styles.stem, { backgroundColor: theme.colors.accent }]} />
        <View style={[styles.leafTop, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.leafBottom, { backgroundColor: theme.colors.accent }]} />
        <View style={[styles.breeze, { borderColor: theme.colors.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  wordmark: {
    fontFamily: fonts.serifSemibold,
    fontSize: 32,
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  mark: {
    height: 30,
    marginLeft: 6,
    marginTop: -5,
    width: 31,
  },
  stem: {
    borderRadius: 2,
    height: 20,
    left: 14,
    position: 'absolute',
    top: 5,
    transform: [{ rotate: '28deg' }],
    width: 2,
  },
  leafTop: {
    borderBottomLeftRadius: 9,
    borderTopRightRadius: 9,
    height: 10,
    left: 15,
    position: 'absolute',
    top: 2,
    transform: [{ rotate: '-18deg' }],
    width: 15,
  },
  leafBottom: {
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 8,
    height: 8,
    left: 4,
    position: 'absolute',
    top: 13,
    transform: [{ rotate: '18deg' }],
    width: 13,
  },
  breeze: {
    borderBottomWidth: 1.5,
    borderBottomLeftRadius: 10,
    bottom: 0,
    height: 8,
    left: 0,
    position: 'absolute',
    transform: [{ rotate: '-5deg' }],
    width: 20,
  },
});
