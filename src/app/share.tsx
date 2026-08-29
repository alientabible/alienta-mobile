import { useSQLiteContext } from 'expo-sqlite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { getBibleLicense } from '@/features/bible/license';
import { getBook, getVerse } from '@/features/bible/repository';
import type { BibleVersionId } from '@/features/bible/types';
import { getMockReflection, isReflectionId } from '@/features/reflection/mockReflection';
import type { StandardReflectionId } from '@/features/reflection/types';
import { ShareComposer, type ShareContentOption } from '@/features/sharing/ShareComposer';
import { useAppTheme } from '@/theme/ThemeProvider';

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveNumber(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default function ShareRoute() {
  const database = useSQLiteContext();
  const params = useLocalSearchParams<{
    bookId?: string | string[];
    chapter?: string | string[];
    content?: string | string[];
    id?: string | string[];
    source?: string | string[];
    verse?: string | string[];
    versionId?: string | string[];
  }>();
  const source = first(params.source);
  const initialContentId = first(params.content);
  const reflectionId = first(params.id);
  const rawVersionId = first(params.versionId);
  const versionId: BibleVersionId = rawVersionId === 'webp' ? 'webp' : 'rvr1909';
  const bookId = first(params.bookId);
  const chapter = positiveNumber(first(params.chapter));
  const verseNumber = positiveNumber(first(params.verse));
  const invalidBibleRequest =
    source === 'bible' && (!bookId || chapter === null || verseNumber === null);
  const bibleRequestKey = `${versionId}:${bookId ?? ''}:${chapter ?? ''}:${verseNumber ?? ''}`;
  const reflectionOptions = useMemo(
    () => createReflectionOptions(reflectionId),
    [reflectionId],
  );
  const [bibleResult, setBibleResult] = useState<{
    key: string;
    options: ShareContentOption[];
  } | null>(null);
  const [failedRequestKey, setFailedRequestKey] = useState<string | null>(null);

  useEffect(() => {
    if (source !== 'bible' || !bookId || chapter === null || verseNumber === null) return;
    let active = true;

    void (async () => {
      try {
        const [book, verse] = await Promise.all([
          getBook(database, bookId),
          getVerse(database, versionId, bookId, chapter, verseNumber),
        ]);
        if (!active) return;
        if (!book || !verse) {
          setFailedRequestKey(bibleRequestKey);
          return;
        }
        const license = getBibleLicense(versionId);
        const bookName = versionId === 'webp' ? book.nameEn : book.nameEs;
        setBibleResult({
          key: bibleRequestKey,
          options: [
            {
              id: 'verse',
              label: versionId === 'webp' ? 'Verse' : 'Versículo',
              content: {
                attribution:
                  versionId === 'webp'
                    ? `${license.shortName} · Public Domain · eBible.org`
                    : `${license.shortName} · Dominio público · eBible.org`,
                body: verse.text,
                kind: 'verse',
                reference: `${bookName} ${chapter}:${verseNumber} · ${license.shortName}`,
              },
            },
          ],
        });
      } catch {
        if (active) setFailedRequestKey(bibleRequestKey);
      }
    })();

    return () => {
      active = false;
    };
  }, [bibleRequestKey, bookId, chapter, database, source, verseNumber, versionId]);

  const bibleOptions = bibleResult?.key === bibleRequestKey ? bibleResult.options : null;
  const options = source === 'reflection' ? reflectionOptions : bibleOptions;
  if (
    invalidBibleRequest ||
    failedRequestKey === bibleRequestKey ||
    (source === 'reflection' && !reflectionOptions) ||
    (source !== 'bible' && source !== 'reflection')
  ) {
    return <ShareError />;
  }
  if (!options) return <ShareLoading />;
  return <ShareComposer contentOptions={options} initialContentId={initialContentId} />;
}

function createReflectionOptions(value: string | undefined): ShareContentOption[] | null {
  if (!isReflectionId(value) || value === 'urgent') return null;
  const reflection = getMockReflection(value as StandardReflectionId);
  return [
    {
      id: 'verse',
      label: 'Versículo',
      content: {
        attribution: 'RVR1909 · Dominio público · eBible.org',
        body: reflection.verse,
        kind: 'verse',
        reference: reflection.reference,
      },
    },
    {
      id: 'reflection',
      label: 'Reflexión',
      content: {
        attribution: 'Reflexión local de Alienta · Contenido de acompañamiento',
        body: reflection.reflection,
        kind: 'reflection',
        reference: 'Una palabra para hoy · Alienta',
        title: reflection.title,
      },
    },
  ];
}

function ShareLoading() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  return (
    <SafeAreaView style={[styles.stateScreen, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <AppText color="textMuted">{t('sharing.loading')}</AppText>
    </SafeAreaView>
  );
}

function ShareError() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  return (
    <SafeAreaView style={[styles.stateScreen, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.errorMark, { backgroundColor: theme.colors.primarySoft }]}>
        <AppIcon
          name={{ android: 'broken_image', ios: 'photo.badge.exclamationmark' }}
          size={28}
          tintColor={theme.colors.primary}
        />
      </View>
      <AppText accessibilityRole="header" variant="heading">
        {t('sharing.notFoundTitle')}
      </AppText>
      <AppText color="textMuted" style={styles.errorDescription}>
        {t('sharing.notFoundDescription')}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={[styles.backAction, { borderColor: theme.colors.primary }]}
      >
        <AppText color="primary">{t('common.back')}</AppText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stateScreen: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 28,
  },
  errorMark: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  errorDescription: { maxWidth: 480, textAlign: 'center' },
  backAction: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    minWidth: 140,
    padding: 14,
  },
});
