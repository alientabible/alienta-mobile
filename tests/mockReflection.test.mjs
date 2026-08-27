import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getMockReflection,
  resolveMockReflectionId,
} from '../src/features/reflection/mockReflection.ts';

test('prioriza una señal urgente sobre la emoción seleccionada', () => {
  assert.equal(
    resolveMockReflectionId({ emotion: 'grateful', note: 'Quiero suicidarme' }),
    'urgent',
  );
});

test('clasifica el texto localmente sin conservar la frase original', () => {
  const result = resolveMockReflectionId({
    emotion: null,
    note: 'Estoy muy preocupado y necesito descansar',
  });

  assert.equal(result, 'peace');
  assert.equal(result.includes('preocupado'), false);
});

test('respeta la emoción elegida cuando no hay una señal urgente', () => {
  assert.equal(
    resolveMockReflectionId({ emotion: 'hopeful', note: 'Quiero volver a comenzar' }),
    'hopeful',
  );
});

test('usa una reflexión general cuando no reconoce una categoría', () => {
  assert.equal(resolveMockReflectionId({ emotion: null, note: 'Un día difícil' }), 'other');
});

test('cada reflexión estándar incluye contenido bíblico y acciones locales', () => {
  for (const id of ['peace', 'grateful', 'lonely', 'hopeful', 'other']) {
    const reflection = getMockReflection(id);

    assert.ok(reflection.verse.length > 0);
    assert.ok(reflection.reference.length > 0);
    assert.ok(reflection.reflection.length > 0);
    assert.ok(reflection.prayer.length > 0);
    assert.ok(reflection.action.length > 0);
  }
});
