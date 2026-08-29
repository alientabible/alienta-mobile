import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { parseVerseLine } from '../scripts/import-bible/build-database.ts';
import { PROTESTANT_66 } from '../scripts/import-bible/canon.ts';
import { BIBLE_SOURCE_MANIFESTS } from '../scripts/import-bible/manifest.ts';
import {
  validateAllLicenses,
  validateLicenseManifest,
} from '../scripts/import-bible/validate-license.ts';
import {
  parseBibleReference,
  resolveBook,
} from '../src/features/bible/repository.ts';

test('el canon aprobado contiene 66 libros y 1189 capítulos', () => {
  assert.equal(PROTESTANT_66.length, 66);
  assert.equal(PROTESTANT_66.reduce((total, book) => total + book.chapters, 0), 1189);
  assert.equal(PROTESTANT_66[0].id, 'GEN');
  assert.equal(PROTESTANT_66.at(-1).id, 'REV');
});

test('las licencias y sus instantáneas cumplen el manifiesto', async () => {
  for (const manifest of BIBLE_SOURCE_MANIFESTS) {
    assert.doesNotThrow(() => validateLicenseManifest(manifest));
  }
  await assert.doesNotReject(() => validateAllLicenses(process.cwd()));
});

test('el parser VPL conserva el texto y normaliza identificadores de libros', () => {
  assert.deepEqual(parseVerseLine('JOH 3:16 For God so loved the world.'), {
    bookId: 'JHN',
    chapter: 3,
    verse: 16,
    text: 'For God so loved the world.',
  });
  assert.deepEqual(parseVerseLine('NUM 12:16 '), {
    bookId: 'NUM',
    chapter: 12,
    verse: 16,
    text: '',
  });
});

test('reconoce referencias bíblicas en español', () => {
  const parsed = parseBibleReference('Juan 3:16');
  assert.deepEqual(parsed, { bookQuery: 'juan', chapter: 3, verse: 16 });

  const books = PROTESTANT_66.map((book, index) => ({
    id: book.id,
    canonOrder: index + 1,
    testament: book.testament,
    chapters: book.chapters,
    nameEs: book.nameEs,
    nameEn: book.nameEn,
    abbreviationEs: book.abbreviationEs,
    abbreviationEn: book.abbreviationEn,
    searchKeys: [book.id, book.nameEs, book.nameEn, ...book.aliases].join('|'),
  }));
  assert.equal(resolveBook(books, '1 Corintios')?.id, '1CO');
  assert.equal(resolveBook(books, 'salmos')?.id, 'PSA');
});

test('la base empaquetada contiene ambas traducciones y permite búsqueda completa', async () => {
  const databasePath = path.join(process.cwd(), 'assets', 'data', 'alienta-bible.db');
  const manifestPath = path.join(process.cwd(), 'assets', 'data', 'alienta-bible.manifest.json');
  assert.equal(existsSync(databasePath), true);
  assert.equal(existsSync(manifestPath), true);
  const databaseBytes = await readFile(databasePath);
  const bundledManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(
    bundledManifest.databaseSha256,
    createHash('sha256').update(databaseBytes).digest('hex'),
  );
  assert.equal(bundledManifest.books, 66);
  assert.equal(bundledManifest.chapters, 1189);
  assert.equal(bundledManifest.verses, 62_205);
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM books').get().count, 66);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM translations').get().count, 2);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM verses').get().count, 62_205);
    const result = database
      .prepare(
        `SELECT v.book_id, v.chapter, v.verse
         FROM verses_fts
         JOIN verses v ON v.verse_key = verses_fts.verse_key
         WHERE verses_fts MATCH ? AND v.version_id = ?
         LIMIT 1`,
      )
      .get('"quietos"*', 'rvr1909');
    assert.ok(result);
  } finally {
    database.close();
  }
});
