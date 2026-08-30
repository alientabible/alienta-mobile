import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createCompletedOnboarding,
  createInitialOnboardingAnswers,
  ONBOARDING_VERSION,
  parseStoredOnboarding,
} from '../src/features/onboarding/model.ts';

test('crea un onboarding local sin activar recordatorios por defecto', () => {
  assert.deepEqual(createInitialOnboardingAnswers(), {
    language: 'es-CO',
    reminder: { enabled: false, hour: 20, minute: 30 },
  });
});

test('conserva las preferencias válidas al completar la bienvenida', () => {
  const completed = createCompletedOnboarding(
    {
      emotion: 'hopeful',
      familiarity: 'new',
      language: 'es-CO',
      purpose: 'bible',
      reminder: { enabled: true, hour: 7, minute: 30 },
      rhythm: 'three',
    },
    '2026-08-30T12:00:00.000Z',
  );

  assert.equal(completed.version, ONBOARDING_VERSION);
  assert.equal(completed.completed, true);
  assert.equal(completed.completedAt, '2026-08-30T12:00:00.000Z');
  assert.equal(parseStoredOnboarding(JSON.stringify(completed))?.answers.emotion, 'hopeful');
});

test('descarta identificadores desconocidos y limita una hora dañada', () => {
  const parsed = parseStoredOnboarding(
    JSON.stringify({
      answers: {
        emotion: 'invented',
        familiarity: 'expert',
        language: 'invented',
        purpose: 'unknown-purpose',
        reminder: { enabled: true, hour: 90, minute: -8 },
        rhythm: 'every-hour',
      },
      completed: true,
      version: ONBOARDING_VERSION,
    }),
  );

  assert.deepEqual(parsed, {
    answers: {
      language: 'es-CO',
      reminder: { enabled: true, hour: 23, minute: 0 },
    },
    completed: true,
    version: ONBOARDING_VERSION,
  });
});

test('ignora datos ilegibles o de otra versión', () => {
  assert.equal(parseStoredOnboarding('{no-json'), null);
  assert.equal(
    parseStoredOnboarding(JSON.stringify({ answers: {}, completed: true, version: 99 })),
    null,
  );
});
