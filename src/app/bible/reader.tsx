import { useLocalSearchParams } from 'expo-router';

import { BibleReader } from '@/features/bible/BibleReader';
import type { BibleVersionId } from '@/features/bible/types';

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
function safeNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default function BibleReaderRoute() {
  const params = useLocalSearchParams<{
    bookId?: string | string[];
    chapter?: string | string[];
    verse?: string | string[];
    versionId?: string | string[];
  }>();
  const rawVersionId = first(params.versionId);
  const versionId: BibleVersionId = rawVersionId === 'webp' ? 'webp' : 'rvr1909';

  return (
    <BibleReader
      initialBookId={first(params.bookId) ?? 'PSA'}
      initialChapter={safeNumber(first(params.chapter), 23)}
      initialVerse={params.verse ? safeNumber(first(params.verse), 1) : null}
      initialVersionId={versionId}
    />
  );
}
