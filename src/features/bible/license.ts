import type { BibleVersionId } from '@/features/bible/types';

export type BibleLicense = {
  versionId: BibleVersionId;
  displayName: string;
  shortName: string;
  languageTag: 'es' | 'en';
  canon: 'protestant-66';
  rightsHolder: string | null;
  licenseName: 'Public Domain';
  licenseUrl: string;
  attribution: string;
  allowsOffline: true;
  allowsCommercialUse: true;
  allowsDerivativeWorks: true;
  shareQuoteLimit: null;
  allowedTerritories: 'worldwide';
  effectiveFrom: string;
  expiresAt: null;
  verifiedAt: string;
  sourceSha256: string;
};

export const BIBLE_LICENSES: readonly BibleLicense[] = [
  {
    versionId: 'rvr1909',
    displayName: 'Santa Biblia — Reina-Valera 1909',
    shortName: 'RVR1909',
    languageTag: 'es',
    canon: 'protestant-66',
    rightsHolder: null,
    licenseName: 'Public Domain',
    licenseUrl: 'https://ebible.org/spaRV1909/copyright.htm',
    attribution: 'Texto bíblico: Reina-Valera 1909, dominio público. Fuente: eBible.org.',
    allowsOffline: true,
    allowsCommercialUse: true,
    allowsDerivativeWorks: true,
    shareQuoteLimit: null,
    allowedTerritories: 'worldwide',
    effectiveFrom: '1909-01-01',
    expiresAt: null,
    verifiedAt: '2026-08-27',
    sourceSha256: 'e5c553f8044e676375e5f13719493f7f47c54b5f145cc33cb65f12eb6f4dc8e5',
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
    attribution: 'Scripture quotations are from the World English Bible, Public Domain. Source: eBible.org.',
    allowsOffline: true,
    allowsCommercialUse: true,
    allowsDerivativeWorks: true,
    shareQuoteLimit: null,
    allowedTerritories: 'worldwide',
    effectiveFrom: '2020-01-01',
    expiresAt: null,
    verifiedAt: '2026-08-27',
    sourceSha256: 'f08d13b4f0701108f7b9f95d57c201649f37c36359f707c8cf1876538a84d750',
  },
] as const;

export function getBibleLicense(versionId: BibleVersionId) {
  return BIBLE_LICENSES.find((license) => license.versionId === versionId) ?? BIBLE_LICENSES[0];
}
