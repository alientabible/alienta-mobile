import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL } from 'node:url';

import { PROTESTANT_66 } from './canon.ts';
import { BIBLE_SOURCE_MANIFESTS, type BibleSourceManifest } from './manifest.ts';
import { validateAllLicenses } from './validate-license.ts';

type ParsedVerse = {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
};

const SOURCE_BOOK_IDS: Readonly<Record<string, string>> = {
  SOL: 'SNG',
  EZE: 'EZK',
  JOE: 'JOL',
  NAH: 'NAM',
  MAR: 'MRK',
  JOH: 'JHN',
  PHI: 'PHP',
  JAM: 'JAS',
  '1JO': '1JN',
  '2JO': '2JN',
  '3JO': '3JN',
};

function sha256(value: Uint8Array) {
  return createHash('sha256').update(value).digest('hex');
}

export function parseVerseLine(line: string): ParsedVerse {
  const match = /^(\S{3})\s+(\d+):(\d+)(?:\s+(.*))?$/.exec(line.trimEnd());
  if (!match) throw new Error(`Línea VPL inválida: ${line.slice(0, 80)}`);

  return {
    bookId: SOURCE_BOOK_IDS[match[1]] ?? match[1],
    chapter: Number(match[2]),
    verse: Number(match[3]),
    text: (match[4] ?? '').trim(),
  };
}

export function parseAndValidateVpl(raw: string, manifest: BibleSourceManifest) {
  const verses = raw
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(parseVerseLine);

  if (verses.length !== manifest.expectedVerseCount) {
    throw new Error(
      `${manifest.versionId}: se esperaban ${manifest.expectedVerseCount} versículos y llegaron ${verses.length}`,
    );
  }

  const observedBooks = [...new Set(verses.map((verse) => verse.bookId))];
  const expectedBooks = PROTESTANT_66.map((book) => book.id);
  if (observedBooks.join('|') !== expectedBooks.join('|')) {
    throw new Error(`${manifest.versionId}: el canon u orden de libros no coincide con protestant-66`);
  }

  const seen = new Set<string>();
  const observedEmptyReferences: string[] = [];
  for (const verse of verses) {
    const book = PROTESTANT_66.find((candidate) => candidate.id === verse.bookId);
    if (!book || verse.chapter < 1 || verse.chapter > book.chapters || verse.verse < 1) {
      throw new Error(`${manifest.versionId}: referencia inválida ${verse.bookId} ${verse.chapter}:${verse.verse}`);
    }
    if (!verse.text) observedEmptyReferences.push(`${verse.bookId}.${verse.chapter}:${verse.verse}`);
    const key = `${verse.bookId}.${verse.chapter}.${verse.verse}`;
    if (seen.has(key)) throw new Error(`${manifest.versionId}: referencia duplicada ${key}`);
    seen.add(key);
  }

  if (observedEmptyReferences.join('|') !== manifest.allowedEmptyReferences.join('|')) {
    throw new Error(
      `${manifest.versionId}: cambiaron los marcadores vacíos de versificación (${observedEmptyReferences.join(', ')})`,
    );
  }

  for (const book of PROTESTANT_66) {
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      if (!seen.has(`${book.id}.${chapter}.1`)) {
        throw new Error(`${manifest.versionId}: falta el inicio de ${book.id} ${chapter}`);
      }
    }
  }

  return verses;
}

async function downloadAndExtract(manifest: BibleSourceManifest, tempDirectory: string) {
  const response = await fetch(manifest.sourceUrl);
  if (!response.ok) throw new Error(`${manifest.versionId}: descarga fallida (${response.status})`);
  const archive = new Uint8Array(await response.arrayBuffer());
  const observedHash = sha256(archive);
  if (observedHash !== manifest.sourceSha256) {
    throw new Error(
      `${manifest.versionId}: el archivo oficial cambió. Esperado ${manifest.sourceSha256}; recibido ${observedHash}. Revisa la licencia y actualiza el manifiesto conscientemente.`,
    );
  }

  const archivePath = path.join(tempDirectory, `${manifest.versionId}.zip`);
  await writeFile(archivePath, archive);
  return execFileSync('unzip', ['-p', archivePath, manifest.sourceEntry], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
}

function createSchema(database: DatabaseSync) {
  database.exec(`
    PRAGMA page_size = 4096;
    PRAGMA journal_mode = DELETE;
    PRAGMA foreign_keys = ON;

    CREATE TABLE metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    ) WITHOUT ROWID;

    CREATE TABLE translations (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      language_tag TEXT NOT NULL,
      canon TEXT NOT NULL,
      license_name TEXT NOT NULL,
      license_url TEXT NOT NULL,
      attribution TEXT NOT NULL,
      source_url TEXT NOT NULL,
      source_sha256 TEXT NOT NULL
    ) WITHOUT ROWID;

    CREATE TABLE books (
      book_id TEXT PRIMARY KEY NOT NULL,
      canon_order INTEGER NOT NULL UNIQUE,
      testament TEXT NOT NULL,
      chapters INTEGER NOT NULL,
      name_es TEXT NOT NULL,
      name_en TEXT NOT NULL,
      abbreviation_es TEXT NOT NULL,
      abbreviation_en TEXT NOT NULL,
      search_keys TEXT NOT NULL
    ) WITHOUT ROWID;

    CREATE TABLE verses (
      verse_key TEXT PRIMARY KEY NOT NULL,
      version_id TEXT NOT NULL REFERENCES translations(id),
      book_id TEXT NOT NULL REFERENCES books(book_id),
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      UNIQUE(version_id, book_id, chapter, verse)
    ) WITHOUT ROWID;

    CREATE INDEX verses_chapter_idx ON verses(version_id, book_id, chapter, verse);

    CREATE VIRTUAL TABLE verses_fts USING fts5(
      verse_key UNINDEXED,
      version_id UNINDEXED,
      text,
      tokenize = 'unicode61 remove_diacritics 2'
    );
  `);
}

function insertCanonicalBooks(database: DatabaseSync) {
  const insert = database.prepare(`
    INSERT INTO books (
      book_id, canon_order, testament, chapters, name_es, name_en,
      abbreviation_es, abbreviation_en, search_keys
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  PROTESTANT_66.forEach((book, index) => {
    const searchKeys = [
      book.id,
      book.nameEs,
      book.nameEn,
      book.abbreviationEs,
      book.abbreviationEn,
      ...book.aliases,
    ].join('|');
    insert.run(
      book.id,
      index + 1,
      book.testament,
      book.chapters,
      book.nameEs,
      book.nameEn,
      book.abbreviationEs,
      book.abbreviationEn,
      searchKeys,
    );
  });
}

function insertTranslation(
  database: DatabaseSync,
  manifest: BibleSourceManifest,
  verses: ParsedVerse[],
) {
  database.prepare(`
    INSERT INTO translations (
      id, display_name, short_name, language_tag, canon, license_name,
      license_url, attribution, source_url, source_sha256
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    manifest.versionId,
    manifest.displayName,
    manifest.shortName,
    manifest.languageTag,
    manifest.canon,
    manifest.licenseName,
    manifest.licenseUrl,
    manifest.attribution,
    manifest.sourceUrl,
    manifest.sourceSha256,
  );

  const insertVerse = database.prepare(
    'INSERT INTO verses (verse_key, version_id, book_id, chapter, verse, text) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const insertSearch = database.prepare(
    'INSERT INTO verses_fts (verse_key, version_id, text) VALUES (?, ?, ?)',
  );

  for (const verse of verses) {
    const key = `${manifest.versionId}.${verse.bookId}.${verse.chapter}.${verse.verse}`;
    insertVerse.run(key, manifest.versionId, verse.bookId, verse.chapter, verse.verse, verse.text);
    insertSearch.run(key, manifest.versionId, verse.text);
  }
}

export async function buildDatabase(projectRoot = process.cwd()) {
  await validateAllLicenses(projectRoot);
  const outputDirectory = path.join(projectRoot, 'assets', 'data');
  const outputPath = path.join(outputDirectory, 'alienta-bible.db');
  const pendingPath = `${outputPath}.pending`;
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'alienta-bible-import-'));
  await mkdir(outputDirectory, { recursive: true });
  await rm(pendingPath, { force: true });

  const database = new DatabaseSync(pendingPath);
  try {
    createSchema(database);
    database.exec('BEGIN IMMEDIATE');
    database.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)').run('schema_version', '1');
    database.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)').run('canon', 'protestant-66');
    database.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)').run('generated_from', 'eBible VPL');
    insertCanonicalBooks(database);

    for (const manifest of BIBLE_SOURCE_MANIFESTS) {
      const raw = await downloadAndExtract(manifest, temporaryDirectory);
      const verses = parseAndValidateVpl(raw, manifest);
      insertTranslation(database, manifest, verses);
      console.log(`${manifest.shortName}: ${verses.length} versículos verificados`);
    }
    database.exec('COMMIT');
    database.exec('INSERT INTO verses_fts(verses_fts) VALUES (\'optimize\');');
    database.exec('VACUUM;');
  } catch (error) {
    try {
      database.exec('ROLLBACK');
    } catch {
      // No hay una transacción activa si el error ocurrió antes de BEGIN.
    }
    throw error;
  } finally {
    database.close();
    await rm(temporaryDirectory, { recursive: true, force: true });
  }

  await rm(outputPath, { force: true });
  await rename(pendingPath, outputPath);
  const output = await import('node:fs/promises').then(({ readFile }) => readFile(outputPath));
  const databaseSha256 = sha256(output);
  const bundledManifest = {
    schemaVersion: 1,
    canon: 'protestant-66',
    books: PROTESTANT_66.length,
    chapters: PROTESTANT_66.reduce((total, book) => total + book.chapters, 0),
    verses: BIBLE_SOURCE_MANIFESTS.reduce(
      (total, manifest) => total + manifest.expectedVerseCount,
      0,
    ),
    translations: BIBLE_SOURCE_MANIFESTS.map((manifest) => ({
      id: manifest.versionId,
      verses: manifest.expectedVerseCount,
      sourceSha256: manifest.sourceSha256,
    })),
    databaseSha256,
  };
  await writeFile(
    path.join(outputDirectory, 'alienta-bible.manifest.json'),
    `${JSON.stringify(bundledManifest, null, 2)}\n`,
    'utf8',
  );
  console.log(`Base generada: ${outputPath}`);
  console.log(`SHA-256: ${databaseSha256}`);
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (isDirectRun) await buildDatabase();
