export type BibleSourceManifest = {
  versionId: 'rvr1909' | 'webp';
  displayName: string;
  shortName: string;
  languageTag: 'es' | 'en';
  canon: 'protestant-66';
  rightsHolder: string | null;
  licenseName: 'Public Domain';
  licenseUrl: string;
  licenseSnapshot: string;
  attribution: string;
  allowsOffline: true;
  allowsCommercialUse: true;
  allowsDerivativeWorks: true;
  shareQuoteLimit: null;
  allowedTerritories: 'worldwide';
  effectiveFrom: string;
  expiresAt: null;
  sourceUrl: string;
  sourceEntry: string;
  sourceSha256: string;
  sourcePublishedAt: string;
  verifiedAt: string;
  expectedVerseCount: number;
  allowedEmptyReferences: readonly string[];
};

export const BIBLE_SOURCE_MANIFESTS: readonly BibleSourceManifest[] = [
  {
    versionId: 'rvr1909',
    displayName: 'Santa Biblia — Reina-Valera 1909',
    shortName: 'RVR1909',
    languageTag: 'es',
    canon: 'protestant-66',
    rightsHolder: null,
    licenseName: 'Public Domain',
    licenseUrl: 'https://ebible.org/spaRV1909/copyright.htm',
    licenseSnapshot: 'scripts/import-bible/licenses/spaRV1909-copyright.md',
    attribution: 'Texto bíblico: Reina-Valera 1909, dominio público. Fuente: eBible.org.',
    allowsOffline: true,
    allowsCommercialUse: true,
    allowsDerivativeWorks: true,
    shareQuoteLimit: null,
    allowedTerritories: 'worldwide',
    effectiveFrom: '1909-01-01',
    expiresAt: null,
    sourceUrl: 'https://ebible.org/Scriptures/spaRV1909_vpl.zip',
    sourceEntry: 'spaRV1909_vpl.txt',
    sourceSha256: 'e5c553f8044e676375e5f13719493f7f47c54b5f145cc33cb65f12eb6f4dc8e5',
    sourcePublishedAt: '2026-08-08T05:52:26Z',
    verifiedAt: '2026-08-27',
    expectedVerseCount: 31_102,
    allowedEmptyReferences: [
      'NUM.12:16', 'NUM.29:40', '1SA.23:29', '2SA.20:26', '2CH.33:25',
      'JOB.35:16', 'JOB.38:39', 'JOB.38:40', 'JOB.38:41', 'JOB.40:20',
      'JOB.40:21', 'JOB.40:22', 'JOB.40:23', 'JOB.40:24', 'HOS.11:12',
      'JON.1:17', 'ACT.19:41', '2CO.13:14',
    ],
  },
  {
    versionId: 'webp',
    displayName: 'World English Bible — Protestant Edition',
    shortName: 'WEB',
    languageTag: 'en',
    canon: 'protestant-66',
    rightsHolder: null,
    licenseName: 'Public Domain',
    licenseUrl: 'https://ebible.org/engwebp/copyright.htm',
    licenseSnapshot: 'scripts/import-bible/licenses/engwebp-copyright.md',
    attribution: 'Scripture quotations are from the World English Bible, Public Domain. Source: eBible.org.',
    allowsOffline: true,
    allowsCommercialUse: true,
    allowsDerivativeWorks: true,
    shareQuoteLimit: null,
    allowedTerritories: 'worldwide',
    effectiveFrom: '2020-01-01',
    expiresAt: null,
    sourceUrl: 'https://ebible.org/Scriptures/engwebp_vpl.zip',
    sourceEntry: 'engwebp_vpl.txt',
    sourceSha256: 'f08d13b4f0701108f7b9f95d57c201649f37c36359f707c8cf1876538a84d750',
    sourcePublishedAt: '2026-08-26T07:09:11Z',
    verifiedAt: '2026-08-27',
    expectedVerseCount: 31_103,
    allowedEmptyReferences: [
      'LUK.17:36', 'ACT.8:37', 'ACT.15:34', 'ACT.24:7', 'ROM.16:25',
    ],
  },
] as const;
