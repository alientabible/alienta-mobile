export type BibleVersionId = 'rvr1909' | 'webp';

export type BibleTranslation = {
  id: BibleVersionId;
  displayName: string;
  shortName: string;
  languageTag: 'es' | 'en';
  canon: 'protestant-66';
  licenseName: string;
  licenseUrl: string;
  attribution: string;
  sourceUrl: string;
  sourceSha256: string;
};
export type BibleBook = {
  id: string;
  canonOrder: number;
  testament: 'old' | 'new';
  chapters: number;
  nameEs: string;
  nameEn: string;
  abbreviationEs: string;
  abbreviationEn: string;
  searchKeys: string;
};

export type BibleVerse = {
  key: string;
  versionId: BibleVersionId;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
};

export type BibleSearchResult = BibleVerse & {
  bookName: string;
  versionName: string;
};

export type ReadingLocation = {
  versionId: BibleVersionId;
  bookId: string;
  chapter: number;
  verse: number | null;
};

export type ParsedBibleReference = {
  bookQuery: string;
  chapter: number;
  verse: number | null;
};
