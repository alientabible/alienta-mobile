import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { BibleVersionSwitch } from '@/features/bible/BibleVersionSwitch';
import {
  getBooks,
  getTranslations,
  parseBibleReference,
  resolveBook,
  searchBible,
} from '@/features/bible/repository';
import type {
  BibleBook,
  BibleSearchResult,
  BibleTranslation,
  BibleVersionId,
} from '@/features/bible/types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

type SearchState = 'idle' | 'loading' | 'done' | 'invalid-reference';

export function BibleSearch() {
  const database = useSQLiteContext();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'bible');
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [versionId, setVersionId] = useState<BibleVersionId>('rvr1909');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BibleSearchResult[]>([]);
  const [state, setState] = useState<SearchState>('idle');

  useEffect(() => {
    let active = true;
    void Promise.all([getTranslations(database), getBooks(database)]).then(
      ([availableTranslations, availableBooks]) => {
        if (!active) return;
        setTranslations(availableTranslations);
        setBooks(availableBooks);
      },
    );
    return () => {
      active = false;
    };
  }, [database]);

  const openResult = useCallback(
    (result: BibleSearchResult) => {
      router.push({
        pathname: '/bible/reader',
        params: {
          bookId: result.bookId,
          chapter: String(result.chapter),
          verse: String(result.verse),
          versionId: result.versionId,
        },
      });
    },
    [router],
  );

  const submitSearch = useCallback(async () => {
    const value = query.trim();
    if (value.length < 2) return;
    Keyboard.dismiss();
    setState('loading');
    setResults([]);

    const parsedReference = parseBibleReference(value);
    if (parsedReference) {
      const book = resolveBook(books, parsedReference.bookQuery);
      if (book && parsedReference.chapter <= book.chapters) {
        router.push({
          pathname: '/bible/reader',
          params: {
            bookId: book.id,
            chapter: String(parsedReference.chapter),
            ...(parsedReference.verse ? { verse: String(parsedReference.verse) } : {}),
            versionId,
          },
        });
        setState('idle');
        return;
      }
      setState('invalid-reference');
      return;
    }

    try {
      const matches = await searchBible(database, versionId, value);
      setResults(matches);
      setState('done');
    } catch {
      setResults([]);
      setState('done');
    }
  }, [books, database, query, router, versionId]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <FlatList
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {state === 'loading' ? (
              <ActivityIndicator color={palette.accent} size="large" />
            ) : (
              <>
                <View style={[styles.emptyIcon, { backgroundColor: palette.soft }]}>
                  <AppIcon
                    name={{ android: 'menu_book', ios: 'text.book.closed' }}
                    size={26}
                    tintColor={palette.accent}
                    type="monochrome"
                  />
                </View>
                <AppText style={styles.emptyTitle} variant="heading">
                  {state === 'invalid-reference'
                    ? t('bible.search.invalidReference')
                    : state === 'done'
                      ? t('bible.search.noResults')
                      : t('bible.search.promptTitle')}
                </AppText>
                <AppText color="textMuted" style={styles.emptyDescription} variant="caption">
                  {state === 'invalid-reference'
                    ? t('bible.search.invalidReferenceDescription')
                    : state === 'done'
                      ? t('bible.search.noResultsDescription')
                      : t('bible.search.promptDescription')}
                </AppText>
              </>
            )}
          </View>
        }
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel={t('common.back')}
                accessibilityRole="button"
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.roundButton,
                  { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon
                  name={{ android: 'arrow_back', ios: 'chevron.left' }}
                  size={21}
                  tintColor={theme.colors.text}
                />
              </Pressable>
              <AppText color="textMuted" style={styles.eyebrow} variant="eyebrow">
                {t('bible.search.eyebrow')}
              </AppText>
              <View style={styles.roundButton} />
            </View>

            <AppText accessibilityRole="header" style={styles.title} variant="hero">
              {t('bible.search.title')}
            </AppText>
            <AppText color="textMuted" style={styles.description}>
              {t('bible.search.description')}
            </AppText>

            <View style={styles.versionSpacing}>
              <BibleVersionSwitch
                onChange={(nextVersion) => {
                  setVersionId(nextVersion);
                  setResults([]);
                  setState('idle');
                }}
                selectedId={versionId}
                translations={translations}
              />
            </View>

            <View
              style={[
                styles.searchBox,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
                getPremiumDepth(theme, 'raised'),
              ]}
            >
              <AppIcon
                name={{ android: 'search', ios: 'magnifyingglass' }}
                size={21}
                tintColor={theme.colors.textMuted}
              />
              <TextInput
                accessibilityLabel={t('bible.search.inputLabel')}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(value) => {
                  setQuery(value);
                  if (state !== 'idle') setState('idle');
                }}
                onSubmitEditing={() => void submitSearch()}
                placeholder={t('bible.search.placeholder')}
                placeholderTextColor={theme.colors.textMuted}
                returnKeyType="search"
                selectionColor={palette.accent}
                style={[styles.input, { color: theme.colors.text }]}
                value={query}
              />
              <Pressable
                accessibilityLabel={t('bible.search.submit')}
                accessibilityRole="button"
                disabled={query.trim().length < 2 || state === 'loading'}
                onPress={() => void submitSearch()}
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: palette.accent },
                  (query.trim().length < 2 || state === 'loading') && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon
                  name={{ android: 'arrow_forward', ios: 'arrow.right' }}
                  size={19}
                  tintColor={palette.onAccent}
                />
              </Pressable>
            </View>

            {results.length > 0 ? (
              <View style={styles.resultsHeading}>
                <AppText variant="heading">{t('bible.search.results')}</AppText>
                <AppText color="textMuted" variant="caption">
                  {t('bible.search.resultCount', { count: results.length })}
                </AppText>
              </View>
            ) : null}
          </View>
        }
        contentContainerStyle={styles.content}
        data={results}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Pressable
            accessibilityHint={t('bible.search.openResultHint')}
            accessibilityLabel={`${item.bookName} ${item.chapter}:${item.verse}`}
            accessibilityRole="button"
            onPress={() => openResult(item)}
            style={({ pressed }) => [
              styles.resultCard,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
              getPremiumDepth(theme, 'raised'),
              pressed && styles.pressed,
            ]}
          >
            <AppText style={[styles.resultReference, { color: palette.accent }]} variant="eyebrow">
              {item.bookName} {item.chapter}:{item.verse} · {item.versionName}
            </AppText>
            <AppText style={styles.resultText} variant="serifBody">
              {item.text}
            </AppText>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 760,
    paddingBottom: 40,
    paddingHorizontal: 24,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  roundButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  eyebrow: { fontSize: 11 },
  title: { fontSize: 46, lineHeight: 52, marginTop: 28 },
  description: { marginTop: 8, maxWidth: 530 },
  versionSpacing: { marginTop: 24 },
  searchBox: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 16,
    minHeight: 66,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 12,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  disabled: { opacity: 0.4 },
  resultsHeading: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 34,
  },
  resultCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
    padding: 18,
  },
  resultReference: { fontSize: 10, lineHeight: 15 },
  resultText: { fontSize: 20, lineHeight: 27, marginTop: 8 },
  emptyState: { alignItems: 'center', marginTop: 64, paddingHorizontal: 24 },
  emptyIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  emptyTitle: { fontSize: 27, lineHeight: 32, marginTop: 18, textAlign: 'center' },
  emptyDescription: { marginTop: 7, maxWidth: 370, textAlign: 'center' },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
});
