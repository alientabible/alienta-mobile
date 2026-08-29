import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildSharePlainText,
  createShareFilename,
  getShareDimensions,
  getShareFontSize,
  getShareTemplate,
  getShareTypography,
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

test('adapta la fuente para el texto más largo sin invadir referencia ni atribución', () => {
  const shortSize = getShareFontSize(verse.body.length, 'large', 'square');
  const longSize = getShareFontSize(LONGEST_BUNDLED_VERSE_LENGTH, 'large', 'square');

  assert.ok(longSize < shortSize);
  assert.ok(longSize >= 10.5);
  assert.ok(longSize <= 12);
  assert.ok(getShareFontSize(LONGEST_BUNDLED_VERSE_LENGTH, 'large', 'story') <= 12.5);
});

test('mantiene límites de líneas estables para ambos formatos', () => {
  const square = getShareTypography(LONGEST_BUNDLED_VERSE_LENGTH, 'comfortable', 'square');
  const story = getShareTypography(LONGEST_BUNDLED_VERSE_LENGTH, 'comfortable', 'story');

  assert.equal(square.maximumBodyLines, 24);
  assert.equal(story.maximumBodyLines, 34);
  assert.ok(square.bodyLineHeight > square.bodyFontSize);
  assert.ok(story.bodyLineHeight > story.bodyFontSize);
  assert.ok(square.quoteFontSize < 48);
});

test('la escala tipográfica disminuye de forma monótona al crecer el contenido', () => {
  const lengths = [60, 100, 160, 220, 300, 400, 500, LONGEST_BUNDLED_VERSE_LENGTH];
  const sizes = lengths.map((length) => getShareFontSize(length, 'comfortable', 'square'));

  for (let index = 1; index < sizes.length; index += 1) {
    assert.ok(sizes[index] <= sizes[index - 1]);
  }
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
