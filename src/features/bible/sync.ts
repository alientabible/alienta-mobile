import type { SupabaseClient } from '@supabase/supabase-js';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { Database } from '@/core/api/database.types';
import {
  applySyncedFavorite,
  applySyncedReadingProgress,
  getLocalBibleSyncSnapshot,
} from '@/features/bible/repository';
import {
  createBibleSyncPlan,
  type BibleSyncFavoriteRecord,
  type BibleSyncReadingRecord,
  type BibleSyncSnapshot,
} from '@/features/bible/syncModel';

type AlientaSupabaseClient = SupabaseClient<Database>;

function normalizeRemoteTimestamp(value: string) {
  return new Date(value).toISOString();
}

function isUniqueViolation(error: { code?: string } | null) {
  return error?.code === '23505';
}

async function getRemoteBibleSyncSnapshot(
  supabase: AlientaSupabaseClient,
  userId: string,
): Promise<BibleSyncSnapshot> {
  const [readingResult, favoritesResult] = await Promise.all([
    supabase
      .from('bible_reading_progress')
      .select('version_id, book_id, chapter, verse, updated_at')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('bible_favorites')
      .select('verse_key, favorited, updated_at')
      .eq('user_id', userId),
  ]);

  if (readingResult.error) throw readingResult.error;
  if (favoritesResult.error) throw favoritesResult.error;

  return {
    reading: readingResult.data
      ? {
          bookId: readingResult.data.book_id,
          chapter: readingResult.data.chapter,
          updatedAt: normalizeRemoteTimestamp(readingResult.data.updated_at),
          verse: readingResult.data.verse,
          versionId: readingResult.data.version_id,
        }
      : null,
    favorites: (favoritesResult.data ?? []).map((row) => ({
      favorited: row.favorited,
      updatedAt: normalizeRemoteTimestamp(row.updated_at),
      verseKey: row.verse_key,
    })),
  };
}

async function pushReading(
  supabase: AlientaSupabaseClient,
  userId: string,
  reading: BibleSyncReadingRecord,
  remoteExists: boolean,
) {
  const insertPayload = {
    book_id: reading.bookId,
    chapter: reading.chapter,
    updated_at: reading.updatedAt,
    user_id: userId,
    verse: reading.verse,
    version_id: reading.versionId,
  };
  const updatePayload = {
    book_id: reading.bookId,
    chapter: reading.chapter,
    updated_at: reading.updatedAt,
    verse: reading.verse,
    version_id: reading.versionId,
  };

  if (!remoteExists) {
    const { error } = await supabase.from('bible_reading_progress').insert(insertPayload);
    if (!error) return;
    if (!isUniqueViolation(error)) throw error;
  }

  const { error } = await supabase
    .from('bible_reading_progress')
    .update(updatePayload)
    .eq('user_id', userId)
    .lt('updated_at', reading.updatedAt);
  if (error) throw error;
}

async function pushFavorite(
  supabase: AlientaSupabaseClient,
  userId: string,
  favorite: BibleSyncFavoriteRecord,
  remoteExists: boolean,
) {
  const insertPayload = {
    favorited: favorite.favorited,
    updated_at: favorite.updatedAt,
    user_id: userId,
    verse_key: favorite.verseKey,
  };
  const updatePayload = {
    favorited: favorite.favorited,
    updated_at: favorite.updatedAt,
  };

  if (!remoteExists) {
    const { error } = await supabase.from('bible_favorites').insert(insertPayload);
    if (!error) return;
    if (!isUniqueViolation(error)) throw error;
  }

  let update = supabase
    .from('bible_favorites')
    .update(updatePayload)
    .eq('user_id', userId)
    .eq('verse_key', favorite.verseKey);
  update = favorite.favorited
    ? update.lt('updated_at', favorite.updatedAt)
    : update.lte('updated_at', favorite.updatedAt);
  const { error } = await update;
  if (error) throw error;
}

export async function synchronizeBibleData(
  database: SQLiteDatabase,
  supabase: AlientaSupabaseClient,
  userId: string,
) {
  const [local, remote] = await Promise.all([
    getLocalBibleSyncSnapshot(database),
    getRemoteBibleSyncSnapshot(supabase, userId),
  ]);
  const plan = createBibleSyncPlan(local, remote);
  const remoteFavoriteKeys = new Set(remote.favorites.map((favorite) => favorite.verseKey));

  if (plan.readingForRemote) {
    await pushReading(supabase, userId, plan.readingForRemote, remote.reading !== null);
  }
  for (const favorite of plan.favoritesForRemote) {
    await pushFavorite(
      supabase,
      userId,
      favorite,
      remoteFavoriteKeys.has(favorite.verseKey),
    );
  }

  if (plan.readingForLocal) {
    await applySyncedReadingProgress(database, plan.readingForLocal);
  }
  for (const favorite of plan.favoritesForLocal) {
    await applySyncedFavorite(database, favorite);
  }

  return {
    localChanged:
      plan.readingForLocal !== null || plan.favoritesForLocal.length > 0,
  };
}
