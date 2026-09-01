import type { ReadingLocation } from '@/features/bible/types';

export type BibleSyncReadingRecord = ReadingLocation & {
  updatedAt: string;
};

export type BibleSyncFavoriteRecord = {
  favorited: boolean;
  updatedAt: string;
  verseKey: string;
};

export type BibleSyncSnapshot = {
  favorites: BibleSyncFavoriteRecord[];
  reading: BibleSyncReadingRecord | null;
};

export type BibleSyncPlan = {
  favoritesForLocal: BibleSyncFavoriteRecord[];
  favoritesForRemote: BibleSyncFavoriteRecord[];
  readingForLocal: BibleSyncReadingRecord | null;
  readingForRemote: BibleSyncReadingRecord | null;
};

function compareTimestamps(left: string, right: string) {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);
  if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
    return leftTime > rightTime ? 1 : -1;
  }
  return left === right ? 0 : left > right ? 1 : -1;
}

function readingsMatch(left: BibleSyncReadingRecord, right: BibleSyncReadingRecord) {
  return (
    left.bookId === right.bookId &&
    left.chapter === right.chapter &&
    left.updatedAt === right.updatedAt &&
    left.verse === right.verse &&
    left.versionId === right.versionId
  );
}

export function createBibleSyncPlan(
  local: BibleSyncSnapshot,
  remote: BibleSyncSnapshot,
): BibleSyncPlan {
  const plan: BibleSyncPlan = {
    favoritesForLocal: [],
    favoritesForRemote: [],
    readingForLocal: null,
    readingForRemote: null,
  };

  if (local.reading && !remote.reading) {
    plan.readingForRemote = local.reading;
  } else if (!local.reading && remote.reading) {
    plan.readingForLocal = remote.reading;
  } else if (local.reading && remote.reading && !readingsMatch(local.reading, remote.reading)) {
    if (compareTimestamps(local.reading.updatedAt, remote.reading.updatedAt) > 0) {
      plan.readingForRemote = local.reading;
    } else {
      // Ante un empate improbable, el registro remoto gana de forma determinista.
      plan.readingForLocal = remote.reading;
    }
  }

  const localFavorites = new Map(local.favorites.map((record) => [record.verseKey, record]));
  const remoteFavorites = new Map(remote.favorites.map((record) => [record.verseKey, record]));
  const verseKeys = new Set([...localFavorites.keys(), ...remoteFavorites.keys()]);

  for (const verseKey of verseKeys) {
    const localFavorite = localFavorites.get(verseKey);
    const remoteFavorite = remoteFavorites.get(verseKey);

    if (localFavorite && !remoteFavorite) {
      plan.favoritesForRemote.push(localFavorite);
      continue;
    }
    if (!localFavorite && remoteFavorite) {
      plan.favoritesForLocal.push(remoteFavorite);
      continue;
    }
    if (!localFavorite || !remoteFavorite) continue;

    const timestampOrder = compareTimestamps(localFavorite.updatedAt, remoteFavorite.updatedAt);
    if (timestampOrder > 0) {
      plan.favoritesForRemote.push(localFavorite);
    } else if (timestampOrder < 0) {
      plan.favoritesForLocal.push(remoteFavorite);
    } else if (localFavorite.favorited !== remoteFavorite.favorited) {
      // Si dos dispositivos cambian a la vez, retirar gana para evitar resucitar favoritos.
      if (localFavorite.favorited) plan.favoritesForLocal.push(remoteFavorite);
      else plan.favoritesForRemote.push(localFavorite);
    }
  }

  return plan;
}
