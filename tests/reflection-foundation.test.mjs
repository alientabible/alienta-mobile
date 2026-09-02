import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import test from 'node:test';

import {
  classifyReflectionInput,
} from '../supabase/functions/generate-reflection/classification.ts';
import {
  EDITORIAL_PASSAGES,
  getApprovedEditorialPassages,
  getEditorialCandidates,
} from '../supabase/functions/generate-reflection/editorialPassages.ts';
import { buildReflectionPrompt } from '../supabase/functions/generate-reflection/prompt.ts';
import {
  parseGeneratedReflectionJson,
  validateGeneratedReflection,
  validateReflectionRequest,
} from '../supabase/functions/generate-reflection/schema.ts';
import {
  moderateReflectionInput,
} from '../supabase/functions/generate-reflection/safety.ts';
import {
  getSupportResourcePlan,
} from '../src/features/reflection/supportResources.ts';

const approvedVerseIds = new Set(['rvr1909.PSA.46.10', 'rvr1909.PHP.4.7']);

const validResponse = {
  tone: 'calm',
  title: 'Puedes detenerte por un momento',
  passages: [
    {
      verseId: 'rvr1909.PSA.46.10',
      reason: 'Invita a hacer una pausa sin ignorar lo que está ocurriendo.',
    },
  ],
  reflection: 'No necesitas resolverlo todo en este instante. Una pausa puede darte claridad.',
  prayer: 'Dios, acompáñame en esta pausa y ayúdame a dar un paso prudente.',
  nextStep: 'Respira lentamente tres veces y escribe una acción pequeña para hoy.',
  safetyLevel: 'standard',
};

test('la solicitud exige consentimiento explícito y prohíbe guardar el texto original', () => {
  const valid = validateReflectionRequest({
    locale: 'es-CO',
    emotion: 'peace',
    note: 'Necesito claridad.',
    countryCode: 'CO',
    consent: { processWithAi: true, storeOriginalText: false },
  });
  assert.equal(valid.ok, true);

  const withoutConsent = validateReflectionRequest({
    locale: 'es-CO',
    emotion: 'peace',
    consent: { processWithAi: false, storeOriginalText: false },
  });
  assert.equal(withoutConsent.ok, false);

  const withStorage = validateReflectionRequest({
    locale: 'es-CO',
    emotion: 'peace',
    consent: { processWithAi: true, storeOriginalText: true },
  });
  assert.equal(withStorage.ok, false);
});

test('la respuesta acepta solo JSON acotado y referencias aprobadas', () => {
  assert.equal(validateGeneratedReflection(validResponse, approvedVerseIds).ok, true);
  assert.equal(
    validateGeneratedReflection(
      {
        ...validResponse,
        passages: [{ verseId: 'rvr1909.JHN.3.16', reason: 'Referencia inventada para este caso.' }],
      },
      approvedVerseIds,
    ).ok,
    false,
  );
  assert.equal(
    validateGeneratedReflection({ ...validResponse, verse: 'Texto que no debe venir del modelo.' }, approvedVerseIds).ok,
    false,
  );
  assert.equal(
    parseGeneratedReflectionJson('{respuesta incompleta', approvedVerseIds).ok,
    false,
  );
});

test('las evaluaciones sintéticas cubren rutas estándar, de apoyo y urgentes', async () => {
  const fixturePath = path.join(process.cwd(), 'tests', 'evals', 'reflections.es-CO.json');
  const scenarios = JSON.parse(await readFile(fixturePath, 'utf8'));
  assert.ok(scenarios.length >= 12);
  for (const scenario of scenarios) {
    const result = moderateReflectionInput(scenario.note);
    assert.equal(result.level, scenario.expectedLevel, scenario.id);
    assert.equal(result.category, scenario.expectedCategory, scenario.id);
    assert.equal(result.canGenerateReflection, scenario.expectedLevel === 'standard', scenario.id);
  }
});

test('la clasificación no conserva el texto y limita los temas estructurados', () => {
  const note = 'Estoy muy cansado, solo y preocupado por una decisión.';
  const result = classifyReflectionInput(null, note);
  assert.equal(result.primaryEmotion, 'lonely');
  assert.equal(result.intensity, 'medium');
  assert.ok(result.topics.includes('loneliness'));
  assert.ok(result.topics.includes('rest'));
  assert.ok(result.topics.length <= 4);
  assert.equal(JSON.stringify(result).includes(note), false);
});

test('los candidatos editoriales existen exactamente en la Biblia empaquetada', () => {
  const databasePath = path.join(process.cwd(), 'assets', 'data', 'alienta-bible.db');
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    for (const passage of EDITORIAL_PASSAGES) {
      const row = database
        .prepare('SELECT text FROM verses WHERE verse_key = ? AND length(trim(text)) > 0')
        .get(passage.verseId);
      assert.ok(row, passage.verseId);
      assert.ok(row.text.length > 0, passage.verseId);
    }
  } finally {
    database.close();
  }
});

test('ningún candidato entra a generación sin aprobación pastoral/editorial', () => {
  assert.ok(getEditorialCandidates(['peace']).length > 0);
  assert.deepEqual(getApprovedEditorialPassages(['peace']), []);
});

test('el prompt falla cerrado y solo contiene pasajes proporcionados por la recuperación', () => {
  const request = {
    locale: 'es-CO',
    emotion: 'peace',
    note: 'Necesito un momento de calma.',
    countryCode: 'CO',
    consent: { processWithAi: true, storeOriginalText: false },
  };
  const classification = classifyReflectionInput('peace', request.note);
  const prompt = buildReflectionPrompt(request, classification, [
    {
      verseId: 'rvr1909.PSA.46.10',
      reference: 'Salmos 46:10',
      text: 'Estad quietos, y conoced que yo soy Dios.',
      editorialReason: 'Invita a una pausa.',
    },
  ]);
  assert.match(prompt.instructions, /No inventes referencias/);
  assert.match(prompt.input, /rvr1909\.PSA\.46\.10/);
  assert.doesNotMatch(prompt.input, /123|Línea 106|minsalu/i);

  const urgent = classifyReflectionInput('peace', 'Quiero suicidarme.');
  assert.throws(() => buildReflectionPrompt(request, urgent, []), /human-support flow/);
});

test('los recursos de Colombia son editoriales y otros países usan un fallback sin inventar líneas', () => {
  const colombia = getSupportResourcePlan('co');
  assert.equal(colombia.region, 'CO');
  assert.ok(colombia.resources.some((resource) => resource.href === 'tel:123'));
  assert.ok(colombia.resources.some((resource) => resource.href === 'tel:106'));

  const fallback = getSupportResourcePlan('US');
  assert.equal(fallback.region, 'GLOBAL');
  assert.equal(fallback.resources.some((resource) => resource.kind === 'phone'), false);
});
