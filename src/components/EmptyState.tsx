import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';

type EmptyStateProps = {
  description: string;
  eyebrow: string;
  items: string[];
  title: string;
};

export function EmptyState({ description, eyebrow, items, title }: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View accessibilityElementsHidden style={[styles.mark, { backgroundColor: theme.colors.primary }]}>
        <AppText color="onPrimary" style={styles.markText}>
          A
        </AppText>
      </View>

      <AppText color="primary" variant="eyebrow">
        {eyebrow}
      </AppText>
      <AppText accessibilityRole="header" style={styles.title} variant="hero">
        {title}
      </AppText>
      <AppText color="textMuted" style={styles.description}>
        {description}
      </AppText>

      <View
        accessibilityLabel={items.join('. ')}
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
        ]}
      >
        {items.map((item) => (
          <View key={item} style={styles.item}>
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            <AppText style={styles.itemText}>{item}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 28,
  },
  mark: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    borderRadius: 23,
  },
  markText: {
    fontSize: 23,
    fontWeight: '900',
  },
  title: {
    marginTop: 10,
  },
  description: {
    marginTop: 14,
  },
  card: {
    marginTop: 30,
    gap: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  item: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    marginTop: 9,
    borderRadius: 4,
  },
  itemText: {
    flex: 1,
  },
});
