import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { BIBLE_SOURCE_MANIFESTS, type BibleSourceManifest } from './manifest.ts';

export function validateLicenseManifest(manifest: BibleSourceManifest) {
  const problems: string[] = [];

  if (manifest.canon !== 'protestant-66') problems.push('canon no aprobado');
  if (manifest.licenseName !== 'Public Domain') problems.push('licencia no aprobada');
  if (!manifest.licenseUrl.startsWith('https://ebible.org/')) problems.push('fuente de licencia no primaria');
  if (!manifest.sourceUrl.startsWith('https://ebible.org/Scriptures/')) problems.push('fuente de texto no primaria');
  if (!manifest.allowsOffline) problems.push('no permite uso sin conexión');
  if (!manifest.allowsCommercialUse) problems.push('no permite distribución comercial');
  if (manifest.sourceSha256.length !== 64) problems.push('SHA-256 inválido');
  if (manifest.expectedVerseCount < 31_000) problems.push('conteo de versículos incompleto');

  if (problems.length > 0) {
    throw new Error(`${manifest.versionId}: ${problems.join(', ')}`);
  }
}

export async function validateAllLicenses(projectRoot = process.cwd()) {
  for (const manifest of BIBLE_SOURCE_MANIFESTS) {
    validateLicenseManifest(manifest);
    const snapshotPath = path.join(projectRoot, manifest.licenseSnapshot);
    await access(snapshotPath);
    const snapshot = await readFile(snapshotPath, 'utf8');
    if (!snapshot.includes(manifest.licenseUrl) || !snapshot.includes(manifest.licenseName)) {
      throw new Error(`${manifest.versionId}: la instantánea de licencia no coincide con el manifiesto`);
    }
  }
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (isDirectRun) {
  await validateAllLicenses();
  console.log(`Licencias verificadas: ${BIBLE_SOURCE_MANIFESTS.length}`);
}
