import assert from 'node:assert/strict';
import test from 'node:test';

import {
  resolveChapterEndLock,
  resolveScrollDirection,
  resolveVisibleReadingVerse,
} from '../src/features/bible/readingProgress.ts';

test('mantiene el último versículo estable durante el rebote inferior', () => {
  let endLocked = resolveChapterEndLock(-18, false, 'down');
  assert.equal(endLocked, true);

  endLocked = resolveChapterEndLock(6, endLocked, 'up');
  assert.equal(endLocked, true);

  endLocked = resolveChapterEndLock(14, endLocked, 'down');
  assert.equal(endLocked, true);
});

test('libera el final únicamente cuando el lector sube fuera de la zona de rebote', () => {
  assert.equal(resolveChapterEndLock(33, true, 'up'), false);
  assert.equal(resolveChapterEndLock(33, true, 'down'), true);
});

test('al subir sigue el versículo visible inferior sin saltar al superior', () => {
  const visibleVerses = [
    { index: 12, verse: 13 },
    { index: 13, verse: 14 },
    { index: 14, verse: 15 },
    { index: 15, verse: 16 },
    { index: 16, verse: 17 },
    { index: 17, verse: 18 },
    { index: 18, verse: 19 },
  ];

  assert.equal(resolveVisibleReadingVerse(visibleVerses, 'up'), 19);
  assert.equal(resolveVisibleReadingVerse(visibleVerses.slice(0, -1), 'up'), 18);
  assert.equal(resolveVisibleReadingVerse(visibleVerses, 'down'), 13);
});

test('ignora el ruido mínimo del rebote al decidir la dirección', () => {
  assert.equal(resolveScrollDirection(500, 499, 'down'), 'down');
  assert.equal(resolveScrollDirection(500, 490, 'down'), 'up');
  assert.equal(resolveScrollDirection(500, 510, 'up'), 'down');
});
