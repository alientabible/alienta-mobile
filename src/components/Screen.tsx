import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenReveal } from '@/components/ScreenReveal';
import { useAppTheme } from '@/theme/ThemeProvider';

type ScreenProps = PropsWithChildren<
  ScrollViewProps & {
    contentStyle?: ViewStyle;
  }
>;

export function Screen({ children, contentStyle, ...props }: ScreenProps) {
  const theme = useAppTheme();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        <ScreenReveal>{children}</ScreenReveal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 760,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    width: '100%',
  },
});
