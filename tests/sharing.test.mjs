import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildSharePlainText,
  createShareFilename,
  getShareDimensions,
  getShareFontSize,
  getShareTemplate,
  SHARE_BRAND_WATERMARK,
  SHARE_TEMPLATES,
} from '../src/features/sharing/shareTemplates.ts';

const LONGEST_BUNDLED_VERSE_LENGTH = 575;

const verse = {
  attribution: 'RVR1909 · Dominio público · eBible.org',
  body: 'Estad quietos, y conoced que yo soy Dios.',
  kind: 'verse',
  reference: 'Salmos 46:10 · RVR1909',
};

test('ofrece cuatro estilos curados y recupera un estilo seguro por defecto', () => {
  assert.equal(SHARE_TEMPLATES.length, 4);
  assert.equal(new Set(SHARE_TEMPLATES.map((template) => template.id)).size, 4);
  assert.equal(getShareTemplate('garden').label, 'Jardín');
  assert.equal(getShareTemplate('missing').id, 'parchment');
});

test('genera formatos 1:1 y 9:16 a resolución de publicación', () => {
  assert.deepEqual(getShareDimensions('square'), { height: 1080, width: 1080 });
  assert.deepEqual(getShareDimensions('story'), { height: 1920, width: 1080 });
});

test('adapta la fuente para el texto más largo sin hacerla ilegible', () => {
  const shortSize = getShareFontSize(verse.body.length, 'large', 'square');
  const longSize = getShareFontSize(LONGEST_BUNDLED_VERSE_LENGTH, 'large', 'square');

  assert.ok(longSize < shortSize);
  assert.ok(longSize >= 15);
  assert.ok(getShareFontSize(LONGEST_BUNDLED_VERSE_LENGTH, 'compact', 'story') >= 15);
});

test('el texto compartido conserva cuerpo, referencia y marca de agua', () => {
  const result = buildSharePlainText(verse);

  assert.match(result, /Estad quietos/);
  assert.match(result, /Salmos 46:10 · RVR1909/);
  assert.match(result, new RegExp(SHARE_BRAND_WATERMARK));
});

test('la atribución editorial permanece separada y obligatoria en el contenido', () => {
  assert.equal(verse.attribution, 'RVR1909 · Dominio público · eBible.org');
  assert.ok(verse.attribution.length > 0);
  for (const template of SHARE_TEMPLATES) assert.ok(template.muted.length > 0);
});

test('crea un nombre de archivo estable y seguro para referencias con acentos', () => {
  assert.equal(createShareFilename(verse), 'alienta-salmos-46-10-rvr1909.png');
});
