import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { BibleVersionSwitch } from '@/features/bible/BibleVersionSwitch';
import { useBibleSync } from '@/features/bible/BibleSyncProvider';
import {
  CHAPTER_END_THRESHOLD,
  resolveChapterEndLock,
  resolveScrollDirection,
  resolveVisibleReadingVerse,
  type ScrollDirection,
} from '@/features/bible/readingProgress';
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
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
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
const PROGRAMMATIC_SCROLL_SETTLE_MS = 600;

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
  const reduceMotion = useReducedMotionPreference();
  const { revision: bibleSyncRevision } = useBibleSync();
  const listRef = useRef<FlatList<BibleVerse>>(null);
  const [initialLoadingOpacity] = useState(
    () => new Animated.Value(initialVerse === null ? 0 : 1),
  );
  const initialTargetRef = useRef({
    bookId: initialBookId,
    chapter: Math.max(1, initialChapter),
    verse: initialVerse,
    versionId: initialVersionId,
  });
  const initialTargetPendingRef = useRef(true);
  const initialPositionPendingRef = useRef(initialVerse !== null);
  const initialPositionIndexRef = useRef<number | null>(null);
  const initialPositionVerseRef = useRef(initialVerse);
  const initialPositionFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialPositionRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeInitialPositionRef = useRef<() => void>(() => undefined);
  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualSelectionLockedRef = useRef(initialVerse !== null);
  const programmaticScrollUntilRef = useRef(
    initialVerse !== null ? Number.POSITIVE_INFINITY : 0,
  );
  const requestWebReadingMeasurementRef = useRef<() => void>(() => undefined);
  const scrollDirectionRef = useRef<ScrollDirection>('down');
  const lastScrollOffsetRef = useRef(0);
  const chapterEndLockedRef = useRef(false);
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
  const [initialPositionReady, setInitialPositionReady] = useState(initialVerse === null);
  const [showInitialLoading, setShowInitialLoading] = useState(initialVerse !== null);
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

  const completeInitialPosition = useCallback(() => {
    if (!initialPositionPendingRef.current) return;
    initialPositionPendingRef.current = false;
    initialPositionIndexRef.current = null;
    initialPositionVerseRef.current = null;
    if (initialPositionFallbackTimerRef.current) {
      clearTimeout(initialPositionFallbackTimerRef.current);
      initialPositionFallbackTimerRef.current = null;
    }
    if (initialPositionRetryTimerRef.current) {
      clearTimeout(initialPositionRetryTimerRef.current);
      initialPositionRetryTimerRef.current = null;
    }
    setInitialPositionReady(true);
  }, []);

  useEffect(() => {
    completeInitialPositionRef.current = completeInitialPosition;
  }, [completeInitialPosition]);

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

  useEffect(() => {
    if (!initialPositionReady || !showInitialLoading) return undefined;

    const reveal = Animated.timing(initialLoadingOpacity, {
      duration: reduceMotion ? 0 : 180,
      toValue: 0,
      useNativeDriver: Platform.OS !== 'web',
    });
    reveal.start(({ finished }) => {
      if (finished) setShowInitialLoading(false);
    });
    return () => reveal.stop();
  }, [initialLoadingOpacity, initialPositionReady, reduceMotion, showInitialLoading]);

  const [onViewableItemsChanged] = useState(
    () => ({ viewableItems }: { viewableItems: ViewToken<BibleVerse>[] }) => {
      const initialVerseTarget = initialPositionVerseRef.current;
      if (
        initialPositionPendingRef.current &&
        initialVerseTarget !== null &&
        viewableItems.some(
          (token) => token.isViewable && token.item?.verse === initialVerseTarget,
        )
      ) {
        completeInitialPositionRef.current();
      }
      if (loadingRef.current || manualSelectionLockedRef.current) return;
      if (chapterEndLockedRef.current) return;

      const visibleVerses = viewableItems
        .filter((token) => token.isViewable && token.item)
        .map((token) => ({ index: token.index ?? 0, verse: token.item.verse }));
      const readingVerse = resolveVisibleReadingVerse(
        visibleVerses,
        scrollDirectionRef.current,
      );

      if (readingVerse !== null) {
        markReadingVerseRef.current(readingVerse);
      }
    },
  );

  const positionInitialVerse = useCallback(() => {
    if (!initialPositionPendingRef.current || loadingRef.current) return;
    const index = initialPositionIndexRef.current;
    const verse = initialPositionVerseRef.current;
    if (index === null || verse === null) return;

    programmaticScrollUntilRef.current = Date.now() + PROGRAMMATIC_SCROLL_SETTLE_MS;

    if (index <= 0) {
      listRef.current?.scrollToOffset({ animated: false, offset: 0 });
      completeInitialPositionRef.current();
      return;
    }

    if (Platform.OS === 'web' && typeof document !== 'undefined' && typeof window !== 'undefined') {
      const element = document.getElementById(`bible-verse-${verse}`);
      if (!element) return;
      element.scrollIntoView({ behavior: 'auto', block: 'center' });
      window.requestAnimationFrame(() => completeInitialPositionRef.current());
      return;
    }

    listRef.current?.scrollToIndex({ animated: false, index, viewPosition: 0.32 });
  }, []);

  const releaseManualSelection = useCallback(() => {
    if (!manualSelectionLockedRef.current) return;
    manualSelectionLockedRef.current = false;
    requestWebReadingMeasurementRef.current();
  }, []);

  const handleReaderScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const nextOffset = Math.max(contentOffset.y, 0);
      scrollDirectionRef.current = resolveScrollDirection(
        lastScrollOffsetRef.current,
        nextOffset,
        scrollDirectionRef.current,
      );
      lastScrollOffsetRef.current = nextOffset;

      if (
        Platform.OS === 'web' &&
        manualSelectionLockedRef.current &&
        Date.now() >= programmaticScrollUntilRef.current
      ) {
        releaseManualSelection();
      }

      if (loadingRef.current || manualSelectionLockedRef.current || verses.length === 0) return;
      const distanceFromEnd = contentSize.height - contentOffset.y - layoutMeasurement.height;
      const hasMeasuredContent = contentSize.height > 0 && layoutMeasurement.height > 0;
      const nextChapterEndLock = hasMeasuredContent
        ? resolveChapterEndLock(
            distanceFromEnd,
            chapterEndLockedRef.current,
            scrollDirectionRef.current,
          )
        : chapterEndLockedRef.current;

      if (nextChapterEndLock && distanceFromEnd <= CHAPTER_END_THRESHOLD) {
        chapterEndLockedRef.current = nextChapterEndLock;
        markReadingVerseRef.current(verses[verses.length - 1].verse);
        return;
      }

      chapterEndLockedRef.current = nextChapterEndLock;

      if (Platform.OS === 'web') {
        requestWebReadingMeasurementRef.current();
      }
    },
    [releaseManualSelection, verses],
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
      if (manualSelectionLockedRef.current) return;
      if (chapterEndLockedRef.current) {
        markReadingVerseRef.current(verses[verses.length - 1].verse);
        return;
      }

      const readingLine = window.innerHeight * WEB_READING_LINE_RATIO;
      let closestVerse: { centerDistance: number; distance: number; verse: number } | null = null;
      let bottomVisibleVerse: { bottom: number; verse: number } | null = null;

      for (const verse of verses) {
        const element = document.getElementById(`bible-verse-${verse.verse}`);
        if (!element) continue;
        const bounds = element.getBoundingClientRect();
        if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) continue;

        if (!bottomVisibleVerse || bounds.bottom > bottomVisibleVerse.bottom) {
          bottomVisibleVerse = { bottom: bounds.bottom, verse: verse.verse };
        }

        const crossesReadingLine = bounds.top <= readingLine && bounds.bottom >= readingLine;
        const distance = crossesReadingLine
          ? 0
          : Math.min(Math.abs(bounds.top - readingLine), Math.abs(bounds.bottom - readingLine));
        const centerDistance = Math.abs((bounds.top + bounds.bottom) / 2 - readingLine);

        if (
          !closestVerse ||
          distance < closestVerse.distance ||
          (distance === closestVerse.distance && centerDistance < closestVerse.centerDistance)
        ) {
          closestVerse = { centerDistance, distance, verse: verse.verse };
        }
      }

      const readingVerse =
        scrollDirectionRef.current === 'up' ? bottomVisibleVerse?.verse : closestVerse?.verse;
      if (readingVerse !== undefined) {
        markReadingVerseRef.current(readingVerse);
      }
    };

    const queueReadingPositionMeasurement = () => {
      if (measurementFrame !== null) window.cancelAnimationFrame(measurementFrame);
      measurementFrame = window.requestAnimationFrame(measureReadingPosition);
    };
    requestWebReadingMeasurementRef.current = queueReadingPositionMeasurement;

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
      requestWebReadingMeasurementRef.current = () => undefined;
    };
  }, [loading, verses]);

  const selectReadingVerse = useCallback(
    (verse: number) => {
      manualSelectionLockedRef.current = true;
      programmaticScrollUntilRef.current = 0;
      markReadingVerse(verse, true);
    },
    [markReadingVerse],
  );

  const preparePassageChange = useCallback(() => {
    initialTargetPendingRef.current = false;
    manualSelectionLockedRef.current = false;
    programmaticScrollUntilRef.current = Date.now() + PROGRAMMATIC_SCROLL_SETTLE_MS;
    scrollDirectionRef.current = 'down';
    lastScrollOffsetRef.current = 0;
    chapterEndLockedRef.current = false;
    cancelPendingProgressSave();
    loadingRef.current = true;
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
      manualSelectionLockedRef.current = useInitialVerse && initialTarget.verse !== null;
      if (useInitialVerse && initialTarget.verse !== null) {
        initialPositionIndexRef.current = Math.max(
          chapterVerses.findIndex((verse) => verse.verse === nextActiveVerse),
          0,
        );
        initialPositionVerseRef.current = nextActiveVerse;
        if (initialPositionFallbackTimerRef.current) {
          clearTimeout(initialPositionFallbackTimerRef.current);
        }
        initialPositionFallbackTimerRef.current = setTimeout(
          () => completeInitialPositionRef.current(),
          1400,
        );
      } else if (initialPositionPendingRef.current) {
        completeInitialPositionRef.current();
      }
      latestReadingRef.current = {
        versionId,
        bookId,
        chapter: safeChapter,
        verse: nextActiveVerse,
      };
      setActiveVerse(nextActiveVerse);
      setVerses(chapterVerses);
      setFavoriteKeys(favorites);
      loadingRef.current = false;
      setLoading(false);
      if (useInitialVerse) initialTargetPendingRef.current = false;
      await saveLastReading(database, {
        versionId,
        bookId,
        chapter: safeChapter,
        verse: nextActiveVerse,
      });

    });
    return () => {
      active = false;
    };
  }, [bookId, cancelPendingProgressSave, chapter, database, selectedBook, versionId]);

  useEffect(() => {
    if (verses.length === 0) return undefined;
    let active = true;
    void getFavoriteKeys(database, verses.map((verse) => verse.key)).then((favorites) => {
      if (active) setFavoriteKeys(favorites);
    });
    return () => {
      active = false;
    };
  }, [bibleSyncRevision, database, verses]);

  useEffect(() => {
    return () => {
      cancelPendingProgressSave();
      if (initialPositionFallbackTimerRef.current) {
        clearTimeout(initialPositionFallbackTimerRef.current);
      }
      if (initialPositionRetryTimerRef.current) {
        clearTimeout(initialPositionRetryTimerRef.current);
      }
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

  const openVerseShare = useCallback(
    (verse: BibleVerse) => {
      router.push({
        pathname: '/share',
        params: {
          bookId: verse.bookId,
          chapter: String(verse.chapter),
          source: 'bible',
          verse: String(verse.verse),
          versionId: verse.versionId,
        },
      });
    },
    [router],
  );

  const openPicker = useCallback(() => {
    setPickerStep('book');
    setPickerOpen(true);
  }, []);

  const referenceLabel = selectedBook
    ? `${selectedBook.nameEs} ${displayedChapter}`
    : t('bible.reader.loading');

  const renderVerse = useCallback(
    ({ item }: { item: BibleVerse }) => (
      <BibleVerseRow
        favorite={favoriteKeys.has(item.key)}
        highlighted={activeVerse === item.verse}
        item={item}
        onFavorite={handleFavorite}
        onSelect={selectReadingVerse}
        onShare={openVerseShare}
        textScale={textScale}
      />
    ),
    [activeVerse, favoriteKeys, handleFavorite, openVerseShare, selectReadingVerse, textScale],
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
        initialNumToRender={
          Platform.OS === 'web' || !initialPositionReady ? Math.max(verses.length, 1) : 12
        }
        keyExtractor={(item) => item.key}
        maxToRenderPerBatch={Platform.OS === 'web' ? Math.max(verses.length, 1) : 12}
        onContentSizeChange={positionInitialVerse}
        onMomentumScrollBegin={releaseManualSelection}
        onScroll={handleReaderScroll}
        onScrollBeginDrag={releaseManualSelection}
        onViewableItemsChanged={Platform.OS === 'web' ? undefined : onViewableItemsChanged}
        ref={listRef}
        removeClippedSubviews={false}
        renderItem={renderVerse}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        viewabilityConfig={Platform.OS === 'web' ? undefined : READING_VIEWABILITY_CONFIG}
        windowSize={Platform.OS === 'web' ? 201 : 21}
        onScrollToIndexFailed={({ averageItemLength, index }) => {
          listRef.current?.scrollToOffset({
            animated: false,
            offset: Math.max(averageItemLength * index, 0),
          });
          if (initialPositionPendingRef.current) {
            if (initialPositionRetryTimerRef.current) {
              clearTimeout(initialPositionRetryTimerRef.current);
            }
            initialPositionRetryTimerRef.current = setTimeout(positionInitialVerse, 80);
          }
        }}
      />

      {showInitialLoading ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.initialLoadingOverlay,
            { backgroundColor: theme.colors.background, opacity: initialLoadingOpacity },
          ]}
        >
          <View style={styles.initialLoadingContent}>
            <View style={styles.initialLoadingTopBar}>
              <View
                style={[styles.initialLoadingRound, { backgroundColor: theme.colors.surfaceElevated }]}
              />
              <View
                style={[styles.initialLoadingEyebrow, { backgroundColor: theme.colors.outline }]}
              />
              <View
                style={[styles.initialLoadingRound, { backgroundColor: theme.colors.surfaceElevated }]}
              />
            </View>
            <View
              style={[
                styles.initialLoadingCard,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
                getPremiumDepth(theme, 'raised'),
              ]}
            >
              <View style={[styles.initialLoadingLineShort, { backgroundColor: palette.soft }]} />
              <View style={[styles.initialLoadingLine, { backgroundColor: theme.colors.outline }]} />
              <View
                style={[styles.initialLoadingDivider, { backgroundColor: theme.colors.outline }]}
              />
              <View style={styles.initialLoadingStatus}>
                <ActivityIndicator color={palette.accent} size="small" />
                <AppText color="textMuted" variant="caption">
                  {t('bible.reader.loading')}
                </AppText>
              </View>
            </View>
            <View
              style={[styles.initialLoadingTitle, { backgroundColor: theme.colors.outline }]}
            />
            <View
              style={[styles.initialLoadingVerse, { backgroundColor: theme.colors.surface }]}
            />
            <View
              style={[styles.initialLoadingVerse, { backgroundColor: theme.colors.surface }]}
            />
          </View>
        </Animated.View>
      ) : null}

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
                            selectReadingVerse(1);
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

const BibleVerseRow = memo(function BibleVerseRow({
  favorite,
  highlighted,
  item,
  onFavorite,
  onSelect,
  onShare,
  textScale,
}: {
  favorite: boolean;
  highlighted: boolean;
  item: BibleVerse;
  onFavorite: (verseKey: string) => Promise<void>;
  onSelect: (verse: number) => void;
  onShare: (verse: BibleVerse) => void;
  textScale: number;
}) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'bible');
  const reduceMotion = useReducedMotionPreference();
  const [selection] = useState(() => new Animated.Value(highlighted ? 1 : 0));

  useEffect(() => {
    const destination = highlighted ? 1 : 0;
    selection.stopAnimation();

    if (reduceMotion) {
      selection.setValue(destination);
      return undefined;
    }

    const selectionSpring = Animated.spring(selection, {
      damping: 19,
      mass: 0.9,
      stiffness: 230,
      toValue: destination,
      useNativeDriver: Platform.OS !== 'web',
    });
    selectionSpring.start();
    return () => selectionSpring.stop();
  }, [highlighted, reduceMotion, selection]);

  const animatedStyle = {
    transform: [
      {
        scale: selection.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.018],
        }),
      },
      {
        translateY: selection.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -1.5],
        }),
      },
    ],
  };

  return (
    <Animated.View
      nativeID={`bible-verse-${item.verse}`}
      style={[
        styles.verseRow,
        {
          backgroundColor: highlighted ? palette.soft : 'transparent',
          borderColor: highlighted ? palette.accent : 'transparent',
        },
        highlighted && styles.activeVerseRow,
        highlighted && getPremiumDepth(theme, 'raised'),
        animatedStyle,
      ]}
    >
      <Pressable
        accessibilityHint={t('bible.reader.markReadingHint')}
        accessibilityLabel={t('bible.reader.verseNumber', { verse: item.verse })}
        accessibilityRole="button"
        accessibilityState={{ selected: highlighted }}
        onPress={() => onSelect(item.verse)}
        style={({ pressed }) => [styles.verseReadingButton, pressed && styles.versePressed]}
      >
        <AppText style={[styles.verseNumber, { color: palette.accent }]}>{item.verse}</AppText>
        <AppText
          selectable
          style={[styles.verseText, { fontSize: 21 * textScale, lineHeight: 31 * textScale }]}
        >
          {item.text}
        </AppText>
      </Pressable>
      <View style={styles.verseActions}>
        <Pressable
          accessibilityLabel={t('bible.reader.shareVerse', { verse: item.verse })}
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => onShare(item)}
          style={({ pressed }) => [styles.verseActionButton, pressed && styles.pressed]}
        >
          <AppIcon
            name={{ android: 'ios_share', ios: 'square.and.arrow.up' }}
            size={18}
            tintColor={theme.colors.textMuted}
          />
        </Pressable>
        <Pressable
          accessibilityLabel={
            favorite
              ? t('bible.reader.removeFavorite', { verse: item.verse })
              : t('bible.reader.addFavorite', { verse: item.verse })
          }
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
          hitSlop={6}
          onPress={() => void onFavorite(item.key)}
          style={({ pressed }) => [styles.verseActionButton, pressed && styles.pressed]}
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
    </Animated.View>
  );
});

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
  initialLoadingOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  initialLoadingContent: {
    alignSelf: 'center',
    maxWidth: 760,
    paddingHorizontal: 24,
    paddingTop: 12,
    width: '100%',
  },
  initialLoadingTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  initialLoadingRound: { borderRadius: 18, height: 44, width: 44 },
  initialLoadingEyebrow: { borderRadius: 4, height: 8, opacity: 0.72, width: 88 },
  initialLoadingCard: {
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 22,
    padding: 18,
  },
  initialLoadingLineShort: { borderRadius: 5, height: 9, width: 70 },
  initialLoadingLine: {
    borderRadius: 6,
    height: 22,
    marginTop: 12,
    opacity: 0.68,
    width: '46%',
  },
  initialLoadingDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 20,
    opacity: 0.75,
  },
  initialLoadingStatus: { alignItems: 'center', flexDirection: 'row', gap: 10, minHeight: 40 },
  initialLoadingTitle: {
    borderRadius: 8,
    height: 34,
    marginTop: 40,
    opacity: 0.62,
    width: '44%',
  },
  initialLoadingVerse: { borderRadius: 16, height: 88, marginTop: 18 },
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
  activeVerseRow: {
    zIndex: 2,
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
  verseActions: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 4,
  },
  verseActionButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 32,
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
