import assert from 'node:assert/strict';
import test from 'node:test';

import { createBibleSyncPlan } from '../src/features/bible/syncModel.ts';

const olderReading = {
  bookId: 'PSA',
  chapter: 23,
  updatedAt: '2026-08-31T10:00:00.000Z',
  verse: 1,
  versionId: 'rvr1909',
};

const newerReading = {
  bookId: 'JHN',
  chapter: 3,
  updatedAt: '2026-08-31T11:00:00.000Z',
  verse: 16,
  versionId: 'rvr1909',
};

test('sube el progreso y los favoritos que solo existen localmente', () => {
  const favorite = {
    favorited: true,
    updatedAt: '2026-08-31T10:30:00.000Z',
    verseKey: 'rvr1909:PSA:23:1',
  };
  const plan = createBibleSyncPlan(
    { favorites: [favorite], reading: olderReading },
    { favorites: [], reading: null },
  );

  assert.deepEqual(plan.readingForRemote, olderReading);
  assert.deepEqual(plan.favoritesForRemote, [favorite]);
  assert.equal(plan.readingForLocal, null);
  assert.deepEqual(plan.favoritesForLocal, []);
});

test('aplica localmente el progreso remoto más reciente', () => {
  const plan = createBibleSyncPlan(
    { favorites: [], reading: olderReading },
    { favorites: [], reading: newerReading },
  );

  assert.deepEqual(plan.readingForLocal, newerReading);
  assert.equal(plan.readingForRemote, null);
});

test('sube el progreso local más reciente', () => {
  const plan = createBibleSyncPlan(
    { favorites: [], reading: newerReading },
    { favorites: [], reading: olderReading },
  );

  assert.deepEqual(plan.readingForRemote, newerReading);
  assert.equal(plan.readingForLocal, null);
});

test('una retirada local gana el empate y se envía al servidor', () => {
  const timestamp = '2026-08-31T12:00:00.000Z';
  const verseKey = 'rvr1909:JHN:3:16';
  const plan = createBibleSyncPlan(
    { favorites: [{ favorited: false, updatedAt: timestamp, verseKey }], reading: null },
    { favorites: [{ favorited: true, updatedAt: timestamp, verseKey }], reading: null },
  );

  assert.deepEqual(plan.favoritesForRemote, [
    { favorited: false, updatedAt: timestamp, verseKey },
  ]);
  assert.deepEqual(plan.favoritesForLocal, []);
});

test('una retirada remota gana el empate y se aplica localmente', () => {
  const timestamp = '2026-08-31T12:00:00.000Z';
  const verseKey = 'rvr1909:JHN:3:16';
  const plan = createBibleSyncPlan(
    { favorites: [{ favorited: true, updatedAt: timestamp, verseKey }], reading: null },
    { favorites: [{ favorited: false, updatedAt: timestamp, verseKey }], reading: null },
  );

  assert.deepEqual(plan.favoritesForLocal, [
    { favorited: false, updatedAt: timestamp, verseKey },
  ]);
  assert.deepEqual(plan.favoritesForRemote, []);
});

test('no genera escrituras cuando ambos lados ya coinciden', () => {
  const favorite = {
    favorited: true,
    updatedAt: '2026-08-31T12:00:00.000Z',
    verseKey: 'rvr1909:JHN:3:16',
  };
  const plan = createBibleSyncPlan(
    { favorites: [favorite], reading: newerReading },
    { favorites: [favorite], reading: newerReading },
  );

  assert.deepEqual(plan, {
    favoritesForLocal: [],
    favoritesForRemote: [],
    readingForLocal: null,
    readingForRemote: null,
  });
});
