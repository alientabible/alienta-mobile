import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Modal, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getSectionPalette, type AppTheme } from '@/theme/tokens';

type ReflectionPreparingOverlayProps = {
  visible: boolean;
};

export function ReflectionPreparingOverlay({ visible }: ReflectionPreparingOverlayProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'home');
  const reduceMotion = useReducedMotionPreference();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.stopAnimation();

    if (!visible || reduceMotion) {
      progress.setValue(visible ? 1 : 0);
      return undefined;
    }

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      duration: 620,
      easing: Easing.inOut(Easing.cubic),
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();

    return () => animation.stop();
  }, [progress, reduceMotion, visible]);

  return (
    <Modal
      accessibilityViewIsModal
      animationType="fade"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View
          accessibilityLabel={t('reflection.preparing')}
          accessibilityLiveRegion="polite"
          accessibilityRole="progressbar"
          style={styles.content}
        >
          <Animated.View
            style={[
              styles.orb,
              { backgroundColor: palette.soft, borderColor: palette.accent },
              {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.45, 1],
                }),
                transform: [
                  {
                    scale: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.82, 1.06],
                    }),
                  },
                ],
              },
            ]}
          />
          <AppText style={styles.title} variant="serifBody">
            {t('reflection.preparing')}
          </AppText>
          <AppText color="textMuted" style={styles.caption} variant="caption">
            {t('reflection.preparingCaption')}
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      alignItems: 'center',
      backgroundColor: theme.isDark ? 'rgba(5, 10, 8, 0.86)' : 'rgba(23, 34, 30, 0.58)',
      flex: 1,
      justifyContent: 'center',
      padding: 32,
    },
    content: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.outline,
      borderRadius: 28,
      borderWidth: 1,
      maxWidth: 340,
      paddingHorizontal: 32,
      paddingVertical: 36,
      width: '100%',
    },
    orb: {
      borderRadius: 36,
      borderWidth: 1,
      height: 72,
      width: 72,
    },
    title: {
      fontSize: 25,
      lineHeight: 30,
      marginTop: 20,
      textAlign: 'center',
    },
    caption: {
      lineHeight: 20,
      marginTop: 6,
      textAlign: 'center',
    },
  });
}
