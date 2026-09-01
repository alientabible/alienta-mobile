import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  BibleBook,
  BibleSearchResult,
  BibleTranslation,
  BibleVerse,
  BibleVersionId,
  ParsedBibleReference,
  ReadingLocation,
} from '@/features/bible/types';
import { notifyBibleLocalChange } from './syncEvents.ts';
import type {
  BibleSyncFavoriteRecord,
  BibleSyncReadingRecord,
  BibleSyncSnapshot,
} from '@/features/bible/syncModel';

type TranslationRow = {
  id: BibleVersionId;
  display_name: string;
  short_name: string;
  language_tag: 'es' | 'en';
  canon: 'protestant-66';
  license_name: string;
  license_url: string;
  attribution: string;
  source_url: string;
  source_sha256: string;
};

type BookRow = {
  book_id: string;
  canon_order: number;
  testament: 'old' | 'new';
  chapters: number;
  name_es: string;
  name_en: string;
  abbreviation_es: string;
  abbreviation_en: string;
  search_keys: string;
};

type VerseRow = {
  verse_key: string;
  version_id: BibleVersionId;
  book_id: string;
  chapter: number;
  verse: number;
  text: string;
};

function mapTranslation(row: TranslationRow): BibleTranslation {
  return {
    id: row.id,
    displayName: row.display_name,
    shortName: row.short_name,
    languageTag: row.language_tag,
    canon: row.canon,
    licenseName: row.license_name,
    licenseUrl: row.license_url,
    attribution: row.attribution,
    sourceUrl: row.source_url,
    sourceSha256: row.source_sha256,
  };
}

function mapBook(row: BookRow): BibleBook {
  return {
    id: row.book_id,
    canonOrder: row.canon_order,
    testament: row.testament,
    chapters: row.chapters,
    nameEs: row.name_es,
    nameEn: row.name_en,
    abbreviationEs: row.abbreviation_es,
    abbreviationEn: row.abbreviation_en,
    searchKeys: row.search_keys,
  };
}

function mapVerse(row: VerseRow): BibleVerse {
  return {
    key: row.verse_key,
    versionId: row.version_id,
    bookId: row.book_id,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
  };
}

export async function initializeBibleDatabase(database: SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS reading_progress (
      singleton INTEGER PRIMARY KEY NOT NULL CHECK (singleton = 1),
      version_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS favorite_verses (
      verse_key TEXT PRIMARY KEY NOT NULL,
      created_at TEXT NOT NULL,
      favorited INTEGER NOT NULL DEFAULT 1 CHECK (favorited IN (0, 1)),
      updated_at TEXT NOT NULL
    ) WITHOUT ROWID;
    CREATE TABLE IF NOT EXISTS user_preferences (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    ) WITHOUT ROWID;
  `);

  const favoriteColumns = await database.getAllAsync<{ name: string }>(
    'PRAGMA table_info(favorite_verses)',
  );
  const favoriteColumnNames = new Set(favoriteColumns.map((column) => column.name));
  if (!favoriteColumnNames.has('favorited')) {
    await database.execAsync(
      'ALTER TABLE favorite_verses ADD COLUMN favorited INTEGER NOT NULL DEFAULT 1;',
    );
  }
  if (!favoriteColumnNames.has('updated_at')) {
    await database.execAsync('ALTER TABLE favorite_verses ADD COLUMN updated_at TEXT;');
  }
  await database.execAsync(
    'UPDATE favorite_verses SET updated_at = created_at WHERE updated_at IS NULL;',
  );
}

export async function getTranslations(database: SQLiteDatabase) {
  const rows = await database.getAllAsync<TranslationRow>(
    'SELECT * FROM translations ORDER BY CASE id WHEN \'rvr1909\' THEN 1 ELSE 2 END',
  );
  return rows.map(mapTranslation);
}

export async function getBooks(database: SQLiteDatabase) {
  const rows = await database.getAllAsync<BookRow>('SELECT * FROM books ORDER BY canon_order');
  return rows.map(mapBook);
}

export async function getBook(database: SQLiteDatabase, bookId: string) {
  const row = await database.getFirstAsync<BookRow>('SELECT * FROM books WHERE book_id = ?', bookId);
  return row ? mapBook(row) : null;
}

export async function getChapter(
  database: SQLiteDatabase,
  versionId: BibleVersionId,
  bookId: string,
  chapter: number,
) {
  const rows = await database.getAllAsync<VerseRow>(
    `SELECT * FROM verses
     WHERE version_id = ? AND book_id = ? AND chapter = ? AND length(trim(text)) > 0
     ORDER BY verse`,
    versionId,
    bookId,
    chapter,
  );
  return rows.map(mapVerse);
}

export async function getVerse(
  database: SQLiteDatabase,
  versionId: BibleVersionId,
  bookId: string,
  chapter: number,
  verse: number,
) {
  const row = await database.getFirstAsync<VerseRow>(
    `SELECT * FROM verses
     WHERE version_id = ? AND book_id = ? AND chapter = ? AND verse = ?`,
    versionId,
    bookId,
    chapter,
    verse,
  );
  return row ? mapVerse(row) : null;
}

export function normalizeBibleSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9áéíóúüñ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseBibleReference(value: string): ParsedBibleReference | null {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9:\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const match = /^(.+?)\s+(\d{1,3})(?::(\d{1,3}))?$/.exec(normalized);
  if (!match) return null;
  const chapter = Number(match[2]);
  const verse = match[3] ? Number(match[3]) : null;
  if (chapter < 1 || (verse !== null && verse < 1)) return null;
  return { bookQuery: match[1], chapter, verse };
}

export function resolveBook(books: BibleBook[], bookQuery: string) {
  const query = normalizeBibleSearch(bookQuery);
  const exact = books.find((book) =>
    book.searchKeys
      .split('|')
      .map(normalizeBibleSearch)
      .includes(query),
  );
  if (exact) return exact;
  return books.find((book) => normalizeBibleSearch(book.nameEs).startsWith(query)) ?? null;
}

function createFtsQuery(value: string) {
  return normalizeBibleSearch(value)
    .split(' ')
    .filter((term) => term.length > 1)
    .slice(0, 8)
    .map((term) => `"${term.replace(/"/g, '""')}"*`)
    .join(' AND ');
}

export async function searchBible(
  database: SQLiteDatabase,
  versionId: BibleVersionId,
  query: string,
  limit = 50,
) {
  const ftsQuery = createFtsQuery(query);
  if (!ftsQuery) return [];
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const rows = await database.getAllAsync<VerseRow & { book_name: string; version_name: string }>(
    `SELECT v.*, b.name_es AS book_name, t.short_name AS version_name
     FROM verses_fts
     JOIN verses v ON v.verse_key = verses_fts.verse_key
     JOIN books b ON b.book_id = v.book_id
     JOIN translations t ON t.id = v.version_id
     WHERE verses_fts MATCH ? AND v.version_id = ?
     ORDER BY bm25(verses_fts), b.canon_order, v.chapter, v.verse
     LIMIT ?`,
    ftsQuery,
    versionId,
    safeLimit,
  );
  return rows.map<BibleSearchResult>((row) => ({
    ...mapVerse(row),
    bookName: row.book_name,
    versionName: row.version_name,
  }));
}

export async function getLastReading(database: SQLiteDatabase): Promise<ReadingLocation> {
  const row = await database.getFirstAsync<{
    version_id: BibleVersionId;
    book_id: string;
    chapter: number;
    verse: number | null;
  }>('SELECT version_id, book_id, chapter, verse FROM reading_progress WHERE singleton = 1');
  return row
    ? { versionId: row.version_id, bookId: row.book_id, chapter: row.chapter, verse: row.verse }
    : { versionId: 'rvr1909', bookId: 'PSA', chapter: 23, verse: 1 };
}

export async function saveLastReading(database: SQLiteDatabase, location: ReadingLocation) {
  const updatedAt = new Date().toISOString();
  await database.runAsync(
    `INSERT INTO reading_progress (singleton, version_id, book_id, chapter, verse, updated_at)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(singleton) DO UPDATE SET
       version_id = excluded.version_id,
       book_id = excluded.book_id,
       chapter = excluded.chapter,
       verse = excluded.verse,
       updated_at = excluded.updated_at`,
    location.versionId,
    location.bookId,
    location.chapter,
    location.verse,
    updatedAt,
  );
  notifyBibleLocalChange();
}

export async function getFavoriteKeys(database: SQLiteDatabase, verseKeys: string[]) {
  if (verseKeys.length === 0) return new Set<string>();
  const placeholders = verseKeys.map(() => '?').join(',');
  const rows = await database.getAllAsync<{ verse_key: string }>(
    `SELECT verse_key FROM favorite_verses
     WHERE favorited = 1 AND verse_key IN (${placeholders})`,
    verseKeys,
  );
  return new Set(rows.map((row) => row.verse_key));
}

export async function toggleFavorite(database: SQLiteDatabase, verseKey: string) {
  const existing = await database.getFirstAsync<{ favorited: number }>(
    'SELECT favorited FROM favorite_verses WHERE verse_key = ?',
    verseKey,
  );
  const favorited = existing?.favorited !== 1;
  const updatedAt = new Date().toISOString();
  await database.runAsync(
    `INSERT INTO favorite_verses (verse_key, created_at, favorited, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(verse_key) DO UPDATE SET
       favorited = excluded.favorited,
       updated_at = excluded.updated_at`,
    verseKey,
    updatedAt,
    favorited ? 1 : 0,
    updatedAt,
  );
  notifyBibleLocalChange();
  return favorited;
}

export async function getLocalBibleSyncSnapshot(
  database: SQLiteDatabase,
): Promise<BibleSyncSnapshot> {
  const readingRow = await database.getFirstAsync<{
    book_id: string;
    chapter: number;
    updated_at: string;
    verse: number | null;
    version_id: BibleVersionId;
  }>(
    `SELECT version_id, book_id, chapter, verse, updated_at
     FROM reading_progress WHERE singleton = 1`,
  );
  const favoriteRows = await database.getAllAsync<{
    favorited: number;
    updated_at: string;
    verse_key: string;
  }>(
    `SELECT verse_key, favorited, coalesce(updated_at, created_at) AS updated_at
     FROM favorite_verses`,
  );

  return {
    reading: readingRow
      ? {
          bookId: readingRow.book_id,
          chapter: readingRow.chapter,
          updatedAt: readingRow.updated_at,
          verse: readingRow.verse,
          versionId: readingRow.version_id,
        }
      : null,
    favorites: favoriteRows.map((row) => ({
      favorited: row.favorited === 1,
      updatedAt: row.updated_at,
      verseKey: row.verse_key,
    })),
  };
}

export async function applySyncedReadingProgress(
  database: SQLiteDatabase,
  reading: BibleSyncReadingRecord,
) {
  await database.runAsync(
    `INSERT INTO reading_progress (singleton, version_id, book_id, chapter, verse, updated_at)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(singleton) DO UPDATE SET
       version_id = excluded.version_id,
       book_id = excluded.book_id,
       chapter = excluded.chapter,
       verse = excluded.verse,
       updated_at = excluded.updated_at
     WHERE excluded.updated_at > reading_progress.updated_at`,
    reading.versionId,
    reading.bookId,
    reading.chapter,
    reading.verse,
    reading.updatedAt,
  );
}

export async function applySyncedFavorite(
  database: SQLiteDatabase,
  favorite: BibleSyncFavoriteRecord,
) {
  await database.runAsync(
    `INSERT INTO favorite_verses (verse_key, created_at, favorited, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(verse_key) DO UPDATE SET
       favorited = excluded.favorited,
       updated_at = excluded.updated_at
     WHERE excluded.updated_at > favorite_verses.updated_at
       OR (
         excluded.updated_at = favorite_verses.updated_at
         AND excluded.favorited = 0
         AND favorite_verses.favorited = 1
       )`,
    favorite.verseKey,
    favorite.updatedAt,
    favorite.favorited ? 1 : 0,
    favorite.updatedAt,
  );
}

export async function getReaderTextScale(database: SQLiteDatabase) {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_preferences WHERE key = \'bible_text_scale\'',
  );
  const parsed = row ? Number(row.value) : 1;
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0.9), 1.35) : 1;
}

export async function saveReaderTextScale(database: SQLiteDatabase, value: number) {
  const safeValue = Math.min(Math.max(value, 0.9), 1.35);
  await database.runAsync(
    `INSERT INTO user_preferences (key, value) VALUES ('bible_text_scale', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    String(safeValue),
  );
}
