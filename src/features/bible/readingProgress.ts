export type ScrollDirection = 'down' | 'up';

export const SCROLL_DIRECTION_DEAD_ZONE = 2;
export const CHAPTER_END_THRESHOLD = 12;
export const CHAPTER_END_RELEASE_THRESHOLD = 32;

type VisibleVerse = {
  index: number;
  verse: number;
};

export function resolveScrollDirection(
  previousOffset: number,
  nextOffset: number,
  currentDirection: ScrollDirection,
): ScrollDirection {
  const offsetDelta = nextOffset - previousOffset;
  if (Math.abs(offsetDelta) < SCROLL_DIRECTION_DEAD_ZONE) return currentDirection;
  return offsetDelta > 0 ? 'down' : 'up';
}

export function resolveChapterEndLock(
  distanceFromEnd: number,
  currentLock: boolean,
  direction: ScrollDirection,
): boolean {
  if (distanceFromEnd <= CHAPTER_END_THRESHOLD) return true;
  if (currentLock && direction === 'up' && distanceFromEnd > CHAPTER_END_RELEASE_THRESHOLD) {
    return false;
  }
  return currentLock;
}

export function resolveVisibleReadingVerse(
  visibleVerses: readonly VisibleVerse[],
  direction: ScrollDirection,
): number | null {
  if (visibleVerses.length === 0) return null;
  const orderedVerses = [...visibleVerses].sort((first, second) => first.index - second.index);
  return direction === 'up'
    ? orderedVerses[orderedVerses.length - 1].verse
    : orderedVerses[0].verse;
}
