import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { BibleVersionSwitch } from '@/features/bible/BibleVersionSwitch';
import {
  getBooks,
  getChapter,
  getFavoriteKeys,
  getReaderTextScale,
  getTranslations,
  saveLastReading,
  saveReaderTextScale,
  toggleFavorite,
} from '@/features/bible/repository';
import type {
  BibleBook,
  BibleTranslation,
  BibleVerse,
  BibleVersionId,
  ReadingLocation,
} from '@/features/bible/types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

type BibleReaderProps = {
  initialBookId?: string;
  initialChapter?: number;
  initialVerse?: number | null;
  initialVersionId?: BibleVersionId;
};

type PickerStep = 'book' | 'chapter';

const READING_PROGRESS_SAVE_DELAY_MS = 450;
const READING_VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 55,
  minimumViewTime: 220,
};
const WEB_READING_LINE_RATIO = 0.32;

export function BibleReader({
  initialBookId = 'PSA',
  initialChapter = 23,
  initialVerse = null,
  initialVersionId = 'rvr1909',
}: BibleReaderProps) {
  const database = useSQLiteContext();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'bible');
  const listRef = useRef<FlatList<BibleVerse>>(null);
  const initialTargetRef = useRef({
    bookId: initialBookId,
    chapter: Math.max(1, initialChapter),
    verse: initialVerse,
    versionId: initialVersionId,
  });
  const initialTargetPendingRef = useRef(true);
  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeVerseRef = useRef(initialVerse ?? 1);
  const loadingRef = useRef(true);
  const latestReadingRef = useRef<ReadingLocation>({
    bookId: initialBookId,
    chapter: Math.max(1, initialChapter),
    verse: initialVerse ?? 1,
    versionId: initialVersionId,
  });
  const markReadingVerseRef = useRef<(verse: number) => void>(() => undefined);
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [versionId, setVersionId] = useState<BibleVersionId>(initialVersionId);
  const [bookId, setBookId] = useState(initialBookId);
  const [chapter, setChapter] = useState(Math.max(1, initialChapter));
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());
  const [activeVerse, setActiveVerse] = useState(initialVerse ?? 1);
  const [textScale, setTextScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerStep, setPickerStep] = useState<PickerStep>('book');

  const selectedBook = useMemo(
    () => books.find((book) => book.id === bookId) ?? null,
    [bookId, books],
  );
  const selectedTranslation = useMemo(
    () => translations.find((translation) => translation.id === versionId) ?? null,
    [translations, versionId],
  );
  const displayedChapter = selectedBook
    ? Math.min(Math.max(chapter, 1), selectedBook.chapters)
    : chapter;

  const cancelPendingProgressSave = useCallback(() => {
    if (!progressSaveTimerRef.current) return;
    clearTimeout(progressSaveTimerRef.current);
    progressSaveTimerRef.current = null;
  }, []);

  const persistReadingProgress = useCallback(
    (verse: number, immediate = false) => {
      cancelPendingProgressSave();
      const location = { bookId, chapter: displayedChapter, verse, versionId };
      latestReadingRef.current = location;
      const save = () => {
        progressSaveTimerRef.current = null;
        void saveLastReading(database, location);
      };

      if (immediate) {
        save();
        return;
      }
      progressSaveTimerRef.current = setTimeout(save, READING_PROGRESS_SAVE_DELAY_MS);
    },
    [bookId, cancelPendingProgressSave, database, displayedChapter, versionId],
  );

  const markReadingVerse = useCallback(
    (verse: number, immediate = false) => {
      const changed = activeVerseRef.current !== verse;
      if (changed) {
        activeVerseRef.current = verse;
        setActiveVerse(verse);
      }
      if (!changed && !immediate) return;
      persistReadingProgress(verse, immediate);
    },
    [persistReadingProgress],
  );

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    markReadingVerseRef.current = markReadingVerse;
  }, [markReadingVerse]);

  const [onViewableItemsChanged] = useState(
    () => ({ viewableItems }: { viewableItems: ViewToken<BibleVerse>[] }) => {
      if (loadingRef.current) return;
      const firstVisibleVerse = viewableItems.find(
        (token) => token.isViewable && token.item,
      )?.item;
      if (firstVisibleVerse) {
        markReadingVerseRef.current(firstVisibleVerse.verse);
      }
    },
  );

  useEffect(() => {
    if (
      Platform.OS !== 'web' ||
      loading ||
      verses.length === 0 ||
      typeof document === 'undefined' ||
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let measurementFrame: number | null = null;

    const measureReadingPosition = () => {
      measurementFrame = null;
      const readingLine = window.innerHeight * WEB_READING_LINE_RATIO;
      let closestVerse: { distance: number; verse: number } | null = null;

      for (const verse of verses) {
        const element = document.getElementById(`bible-verse-${verse.verse}`);
        if (!element) continue;
        const bounds = element.getBoundingClientRect();
        if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) continue;

        const crossesReadingLine = bounds.top <= readingLine && bounds.bottom >= readingLine;
        const distance = crossesReadingLine
          ? 0
          : Math.min(Math.abs(bounds.top - readingLine), Math.abs(bounds.bottom - readingLine));

        if (!closestVerse || distance < closestVerse.distance) {
          closestVerse = { distance, verse: verse.verse };
        }
      }

      if (closestVerse) {
        markReadingVerseRef.current(closestVerse.verse);
      }
    };

    const queueReadingPositionMeasurement = () => {
      if (measurementFrame !== null) window.cancelAnimationFrame(measurementFrame);
      measurementFrame = window.requestAnimationFrame(measureReadingPosition);
    };

    const setupFrame = window.requestAnimationFrame(() => {
      const verseElements = verses
        .map((verse) => document.getElementById(`bible-verse-${verse.verse}`))
        .filter((element): element is HTMLElement => element !== null);

      if (verseElements.length === 0) return;

      observer = new IntersectionObserver(queueReadingPositionMeasurement, {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.01],
      });
      verseElements.forEach((element) => observer?.observe(element));
      measureReadingPosition();
    });

    return () => {
      window.cancelAnimationFrame(setupFrame);
      if (measurementFrame !== null) window.cancelAnimationFrame(measurementFrame);
      observer?.disconnect();
    };
  }, [loading, verses]);

  const preparePassageChange = useCallback(() => {
    initialTargetPendingRef.current = false;
    cancelPendingProgressSave();
    setLoading(true);
    activeVerseRef.current = 1;
    setActiveVerse(1);
    listRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, [cancelPendingProgressSave]);

  useEffect(() => {
    let active = true;
    void Promise.all([getTranslations(database), getBooks(database), getReaderTextScale(database)]).then(
      ([availableTranslations, availableBooks, savedScale]) => {
        if (!active) return;
        setTranslations(availableTranslations);
        setBooks(availableBooks);
        setTextScale(savedScale);
      },
    );
    return () => {
      active = false;
    };
  }, [database]);

  useEffect(() => {
    if (!selectedBook) return;
    const safeChapter = Math.min(Math.max(chapter, 1), selectedBook.chapters);
    const initialTarget = initialTargetRef.current;
    const useInitialVerse =
      initialTargetPendingRef.current &&
      initialTarget.versionId === versionId &&
      initialTarget.bookId === bookId &&
      initialTarget.chapter === safeChapter;
    let active = true;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    cancelPendingProgressSave();
    listRef.current?.scrollToOffset({ animated: false, offset: 0 });

    void getChapter(database, versionId, bookId, safeChapter).then(async (chapterVerses) => {
      const favorites = await getFavoriteKeys(database, chapterVerses.map((verse) => verse.key));
      if (!active) return;
      const requestedVerse = useInitialVerse ? initialTarget.verse : 1;
      const nextActiveVerse = chapterVerses.some((verse) => verse.verse === requestedVerse)
        ? (requestedVerse ?? 1)
        : (chapterVerses[0]?.verse ?? 1);

      activeVerseRef.current = nextActiveVerse;
      latestReadingRef.current = {
        versionId,
        bookId,
        chapter: safeChapter,
        verse: nextActiveVerse,
      };
      setActiveVerse(nextActiveVerse);
      setVerses(chapterVerses);
      setFavoriteKeys(favorites);
      setLoading(false);
      if (useInitialVerse) initialTargetPendingRef.current = false;
      await saveLastReading(database, {
        versionId,
        bookId,
        chapter: safeChapter,
        verse: nextActiveVerse,
      });

      scrollTimer = setTimeout(() => {
        if (!active) return;
        const index = chapterVerses.findIndex((verse) => verse.verse === nextActiveVerse);
        if (index <= 0) {
          listRef.current?.scrollToOffset({ animated: false, offset: 0 });
          return;
        }
        listRef.current?.scrollToIndex({ animated: false, index, viewPosition: 0.25 });
      }, 120);
    });
    return () => {
      active = false;
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [bookId, cancelPendingProgressSave, chapter, database, selectedBook, versionId]);

  useEffect(() => {
    return () => {
      cancelPendingProgressSave();
      void saveLastReading(database, latestReadingRef.current);
    };
  }, [cancelPendingProgressSave, database]);

  const moveChapter = useCallback(
    (direction: -1 | 1) => {
      if (!selectedBook) return;
      if (direction === -1 && chapter > 1) {
        preparePassageChange();
        setChapter((current) => current - 1);
        return;
      }
      if (direction === 1 && chapter < selectedBook.chapters) {
        preparePassageChange();
        setChapter((current) => current + 1);
        return;
      }
      const currentIndex = books.findIndex((book) => book.id === bookId);
      const nextBook = books[currentIndex + direction];
      if (!nextBook) return;
      preparePassageChange();
      setBookId(nextBook.id);
      setChapter(direction === 1 ? 1 : nextBook.chapters);
    },
    [bookId, books, chapter, preparePassageChange, selectedBook],
  );

  const changeTextScale = useCallback(
    (delta: number) => {
      const nextValue = Math.round(Math.min(Math.max(textScale + delta, 0.9), 1.35) * 100) / 100;
      setTextScale(nextValue);
      void saveReaderTextScale(database, nextValue);
    },
    [database, textScale],
  );

  const handleFavorite = useCallback(
    async (verseKey: string) => {
      const isFavorite = await toggleFavorite(database, verseKey);
      setFavoriteKeys((current) => {
        const next = new Set(current);
        if (isFavorite) next.add(verseKey);
        else next.delete(verseKey);
        return next;
      });
    },
    [database],
  );

  const openPicker = useCallback(() => {
    setPickerStep('book');
    setPickerOpen(true);
  }, []);

  const referenceLabel = selectedBook
    ? `${selectedBook.nameEs} ${displayedChapter}`
    : t('bible.reader.loading');

  const renderVerse = useCallback(
    ({ item }: { item: BibleVerse }) => {
      const favorite = favoriteKeys.has(item.key);
      const highlighted = activeVerse === item.verse;
      return (
        <View
          nativeID={`bible-verse-${item.verse}`}
          style={[
            styles.verseRow,
            highlighted && { backgroundColor: palette.soft, borderColor: palette.accent },
          ]}
        >
          <Pressable
            accessibilityHint={t('bible.reader.markReadingHint')}
            accessibilityLabel={t('bible.reader.verseNumber', { verse: item.verse })}
            accessibilityRole="button"
            accessibilityState={{ selected: highlighted }}
            onPress={() => markReadingVerse(item.verse, true)}
            style={({ pressed }) => [styles.verseReadingButton, pressed && styles.versePressed]}
          >
            <AppText style={[styles.verseNumber, { color: palette.accent }]}>{item.verse}</AppText>
            <AppText
              selectable
              style={[
                styles.verseText,
                { fontSize: 21 * textScale, lineHeight: 31 * textScale },
              ]}
            >
              {item.text}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityLabel={
              favorite
                ? t('bible.reader.removeFavorite', { verse: item.verse })
                : t('bible.reader.addFavorite', { verse: item.verse })
            }
            accessibilityRole="button"
            accessibilityState={{ selected: favorite }}
            hitSlop={8}
            onPress={() => void handleFavorite(item.key)}
            style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}
          >
            <AppIcon
              name={{
                android: favorite ? 'favorite' : 'favorite_border',
                ios: favorite ? 'heart.fill' : 'heart',
              }}
              size={19}
              tintColor={favorite ? palette.accent : theme.colors.textMuted}
              type="monochrome"
            />
          </Pressable>
        </View>
      );
    },
    [
      activeVerse,
      favoriteKeys,
      handleFavorite,
      markReadingVerse,
      palette,
      t,
      textScale,
      theme.colors.textMuted,
    ],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <FlatList
        key={`${Platform.OS}-${versionId}-${bookId}-${displayedChapter}-${loading ? 'loading' : 'ready'}`}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={palette.accent} size="large" />
              <AppText color="textMuted" variant="caption">
                {t('bible.reader.loading')}
              </AppText>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.chapterActions}>
              <Pressable
                accessibilityLabel={t('bible.reader.previousChapter')}
                accessibilityRole="button"
                onPress={() => moveChapter(-1)}
                style={({ pressed }) => [
                  styles.chapterButton,
                  { borderColor: theme.colors.outline },
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon
                  name={{ android: 'arrow_back', ios: 'arrow.left' }}
                  size={18}
                  tintColor={theme.colors.text}
                />
                <AppText style={styles.chapterButtonLabel}>{t('bible.reader.previous')}</AppText>
              </Pressable>
              <Pressable
                accessibilityLabel={t('bible.reader.nextChapter')}
                accessibilityRole="button"
                onPress={() => moveChapter(1)}
                style={({ pressed }) => [
                  styles.chapterButton,
                  { borderColor: theme.colors.outline },
                  pressed && styles.pressed,
                ]}
              >
                <AppText style={styles.chapterButtonLabel}>{t('bible.reader.next')}</AppText>
                <AppIcon
                  name={{ android: 'arrow_forward', ios: 'arrow.right' }}
                  size={18}
                  tintColor={theme.colors.text}
                />
              </Pressable>
            </View>
            <AppText color="textMuted" style={styles.attribution} variant="caption">
              {selectedTranslation?.attribution}
            </AppText>
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
              <AppText color="textMuted" style={styles.topTitle} variant="eyebrow">
                {t('bible.reader.eyebrow')}
              </AppText>
              <Pressable
                accessibilityLabel={t('bible.searchTitle')}
                accessibilityRole="button"
                onPress={() => router.push('/bible/search')}
                style={({ pressed }) => [
                  styles.roundButton,
                  { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon
                  name={{ android: 'search', ios: 'magnifyingglass' }}
                  size={21}
                  tintColor={theme.colors.text}
                />
              </Pressable>
            </View>

            <View
              style={[
                styles.readerControls,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
                getPremiumDepth(theme, 'raised'),
              ]}
            >
              <BibleVersionSwitch
                onChange={(nextVersionId) => {
                  preparePassageChange();
                  setVersionId(nextVersionId);
                }}
                selectedId={versionId}
                translations={translations}
              />
              <Pressable
                accessibilityHint={t('bible.reader.referenceHint')}
                accessibilityLabel={referenceLabel}
                accessibilityRole="button"
                onPress={openPicker}
                style={({ pressed }) => [styles.referenceButton, pressed && styles.pressed]}
              >
                <View>
                  <AppText color="textMuted" style={styles.referenceEyebrow} variant="eyebrow">
                    {t('bible.reader.passage')}
                  </AppText>
                  <AppText style={styles.referenceTitle} variant="heading">
                    {referenceLabel}
                  </AppText>
                </View>
                <AppIcon
                  name={{ android: 'expand_more', ios: 'chevron.down' }}
                  size={20}
                  tintColor={palette.accent}
                />
              </Pressable>
              <View style={styles.textScaleRow}>
                <AppText color="textMuted" style={styles.textScaleLabel} variant="caption">
                  {t('bible.reader.textSize')}
                </AppText>
                <View style={styles.textScaleActions}>
                  <Pressable
                    accessibilityLabel={t('bible.reader.decreaseText')}
                    accessibilityRole="button"
                    disabled={textScale <= 0.9}
                    onPress={() => changeTextScale(-0.1)}
                    style={({ pressed }) => [
                      styles.scaleButton,
                      { borderColor: theme.colors.outline },
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText style={styles.scaleSmall}>A</AppText>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={t('bible.reader.increaseText')}
                    accessibilityRole="button"
                    disabled={textScale >= 1.35}
                    onPress={() => changeTextScale(0.1)}
                    style={({ pressed }) => [
                      styles.scaleButton,
                      { borderColor: theme.colors.outline },
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText style={styles.scaleLarge}>A</AppText>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.chapterHeading}>
              <AppText accessibilityRole="header" style={styles.chapterTitle} variant="hero">
                {referenceLabel}
              </AppText>
              <AppText color="textMuted" variant="caption">
                {selectedTranslation?.displayName}
              </AppText>
            </View>
          </View>
        }
        contentContainerStyle={styles.content}
        data={loading ? [] : verses}
        extraData={{ activeVerse, favoriteKeys }}
        initialNumToRender={Platform.OS === 'web' ? Math.max(verses.length, 1) : 12}
        keyExtractor={(item) => item.key}
        maxToRenderPerBatch={Platform.OS === 'web' ? Math.max(verses.length, 1) : 12}
        onViewableItemsChanged={Platform.OS === 'web' ? undefined : onViewableItemsChanged}
        ref={listRef}
        removeClippedSubviews={false}
        renderItem={renderVerse}
        showsVerticalScrollIndicator={false}
        viewabilityConfig={Platform.OS === 'web' ? undefined : READING_VIEWABILITY_CONFIG}
        windowSize={Platform.OS === 'web' ? 201 : 21}
        onScrollToIndexFailed={({ averageItemLength, index }) => {
          listRef.current?.scrollToOffset({
            animated: false,
            offset: Math.max(averageItemLength * index, 0),
          });
        }}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
        transparent
        visible={pickerOpen}
      >
        <View style={styles.modalBackdrop}>
          <SafeAreaView
            style={[styles.modalSheet, { backgroundColor: theme.colors.surfaceElevated }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outline }]}>
              {pickerStep === 'chapter' ? (
                <Pressable
                  accessibilityLabel={t('common.back')}
                  accessibilityRole="button"
                  onPress={() => setPickerStep('book')}
                  style={styles.modalHeaderButton}
                >
                  <AppIcon
                    name={{ android: 'arrow_back', ios: 'chevron.left' }}
                    size={21}
                    tintColor={theme.colors.text}
                  />
                </Pressable>
              ) : (
                <View style={styles.modalHeaderButton} />
              )}
              <AppText style={styles.modalTitle} variant="heading">
                {pickerStep === 'book' ? t('bible.reader.chooseBook') : selectedBook?.nameEs}
              </AppText>
              <Pressable
                accessibilityLabel={t('common.close')}
                accessibilityRole="button"
                onPress={() => setPickerOpen(false)}
                style={styles.modalHeaderButton}
              >
                <AppIcon
                  name={{ android: 'close', ios: 'xmark' }}
                  size={21}
                  tintColor={theme.colors.text}
                />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.pickerContent}>
              {pickerStep === 'book' ? (
                <>
                  <AppText color="textMuted" style={styles.testamentLabel} variant="eyebrow">
                    {t('bible.reader.oldTestament')}
                  </AppText>
                  <View style={styles.bookGrid}>
                    {books.filter((book) => book.testament === 'old').map((book) => (
                      <BookButton
                        book={book}
                        key={book.id}
                        onPress={() => {
                          if (book.id !== bookId || displayedChapter !== 1) {
                            preparePassageChange();
                          }
                          setBookId(book.id);
                          setChapter(1);
                          setPickerStep('chapter');
                        }}
                        selected={book.id === bookId}
                      />
                    ))}
                  </View>
                  <AppText color="textMuted" style={styles.testamentLabel} variant="eyebrow">
                    {t('bible.reader.newTestament')}
                  </AppText>
                  <View style={styles.bookGrid}>
                    {books.filter((book) => book.testament === 'new').map((book) => (
                      <BookButton
                        book={book}
                        key={book.id}
                        onPress={() => {
                          if (book.id !== bookId || displayedChapter !== 1) {
                            preparePassageChange();
                          }
                          setBookId(book.id);
                          setChapter(1);
                          setPickerStep('chapter');
                        }}
                        selected={book.id === bookId}
                      />
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.chapterGrid}>
                  {Array.from({ length: selectedBook?.chapters ?? 0 }, (_, index) => index + 1).map(
                    (chapterNumber) => (
                      <Pressable
                        accessibilityLabel={t('bible.reader.chapterNumber', { chapter: chapterNumber })}
                        accessibilityRole="button"
                        key={chapterNumber}
                        onPress={() => {
                          setPickerOpen(false);
                          if (chapterNumber === displayedChapter) {
                            listRef.current?.scrollToOffset({ animated: true, offset: 0 });
                            markReadingVerse(1, true);
                            return;
                          }
                          preparePassageChange();
                          setChapter(chapterNumber);
                        }}
                        style={({ pressed }) => [
                          styles.chapterChoice,
                          {
                            backgroundColor:
                              chapterNumber === chapter ? palette.accent : theme.colors.surface,
                            borderColor: theme.colors.outline,
                          },
                          pressed && styles.pressed,
                        ]}
                      >
                        <AppText
                          style={{
                            color: chapterNumber === chapter ? palette.onAccent : theme.colors.text,
                          }}
                        >
                          {chapterNumber}
                        </AppText>
                      </Pressable>
                    ),
                  )}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BookButton({
  book,
  onPress,
  selected,
}: {
  book: BibleBook;
  onPress: () => void;
  selected: boolean;
}) {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'bible');
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.bookChoice,
        {
          backgroundColor: selected ? palette.soft : theme.colors.surface,
          borderColor: selected ? palette.accent : theme.colors.outline,
        },
        pressed && styles.pressed,
      ]}
    >
      <AppText style={styles.bookChoiceLabel}>{book.nameEs}</AppText>
      <AppText color="textMuted" style={styles.bookMeta} variant="caption">
        {book.chapters}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    alignSelf: 'center',
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
  topTitle: { fontSize: 11 },
  readerControls: {
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 22,
    padding: 18,
  },
  referenceButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 72,
    paddingTop: 14,
  },
  referenceEyebrow: { fontSize: 9, lineHeight: 14 },
  referenceTitle: { fontSize: 27, lineHeight: 32, marginTop: 1 },
  textScaleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  textScaleLabel: { fontSize: 12 },
  textScaleActions: { flexDirection: 'row', gap: 8 },
  scaleButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 44,
  },
  scaleSmall: { fontSize: 14 },
  scaleLarge: { fontFamily: fonts.serifSemibold, fontSize: 22 },
  chapterHeading: { marginBottom: 18, marginTop: 34 },
  chapterTitle: { fontSize: 42, lineHeight: 48 },
  verseRow: {
    alignItems: 'flex-start',
    borderColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: -10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  verseReadingButton: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
  },
  verseNumber: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    lineHeight: 22,
    marginRight: 10,
    minWidth: 22,
    textAlign: 'right',
  },
  verseText: { flex: 1, fontFamily: fonts.serifMedium },
  versePressed: { opacity: 0.82 },
  favoriteButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginLeft: 5,
    width: 34,
  },
  loadingState: { alignItems: 'center', gap: 14, marginVertical: 80 },
  footer: { paddingTop: 32 },
  chapterActions: { flexDirection: 'row', gap: 10 },
  chapterButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 12,
  },
  chapterButtonLabel: { fontFamily: fonts.sansSemibold, fontSize: 13 },
  attribution: { fontSize: 11, lineHeight: 17, marginTop: 22, textAlign: 'center' },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.58)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '86%',
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: 16,
  },
  modalHeaderButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  modalTitle: { flex: 1, fontSize: 27, lineHeight: 32, textAlign: 'center' },
  pickerContent: { padding: 20, paddingBottom: 48 },
  testamentLabel: { fontSize: 10, marginBottom: 10, marginTop: 10 },
  bookGrid: { gap: 8, marginBottom: 22 },
  bookChoice: {
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  bookChoiceLabel: { flex: 1, fontFamily: fonts.sansSemibold, fontSize: 14 },
  bookMeta: { fontSize: 11 },
  chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chapterChoice: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
