import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveSupabaseConfiguration } from '../src/core/api/supabaseConfig.ts';
import {
  getAccountErrorMessage,
  validateAccountForm,
} from '../src/core/auth/authValidation.ts';

test('mantiene modo invitado cuando Supabase no está configurado', () => {
  assert.deepEqual(resolveSupabaseConfiguration(undefined, undefined), { status: 'missing' });
});

test('rechaza configuración parcial, placeholders y URLs inseguras', () => {
  assert.deepEqual(resolveSupabaseConfiguration('https://demo.supabase.co', undefined), {
    reason: 'partial',
    status: 'invalid',
  });
  assert.deepEqual(
    resolveSupabaseConfiguration(
      'https://TU_PROYECTO.supabase.co',
      'sb_publishable_abcdefghijklmnopqrstuvwxyz',
    ),
    { reason: 'invalid-url', status: 'invalid' },
  );
  assert.deepEqual(
    resolveSupabaseConfiguration(
      'http://example.com',
      'sb_publishable_abcdefghijklmnopqrstuvwxyz',
    ),
    { reason: 'invalid-url', status: 'invalid' },
  );
});

test('acepta Supabase HTTPS y el entorno local explícito', () => {
  assert.equal(
    resolveSupabaseConfiguration(
      'https://alienta.supabase.co',
      'sb_publishable_abcdefghijklmnopqrstuvwxyz',
    ).status,
    'ready',
  );
  assert.equal(
    resolveSupabaseConfiguration(
      'http://127.0.0.1:54321',
      'local_publishable_key_abcdefghijklmnopqrstuvwxyz',
    ).status,
    'ready',
  );
});

test('rechaza una clave secreta antes de crear el cliente', () => {
  assert.deepEqual(
    resolveSupabaseConfiguration(
      'https://alienta.supabase.co',
      'sb_secret_abcdefghijklmnopqrstuvwxyz',
    ),
    { reason: 'invalid-key', status: 'invalid' },
  );
});

test('valida correo y contraseña sin enviar solicitudes', () => {
  assert.deepEqual(validateAccountForm('correo-invalido', '1234'), {
    email: 'Escribe un correo válido.',
    password: 'Usa al menos 8 caracteres.',
  });
  assert.deepEqual(validateAccountForm('persona@ejemplo.com', 'segura123'), {});
});

test('traduce errores de autenticación sin revelar detalles internos', () => {
  assert.equal(
    getAccountErrorMessage(new Error('Invalid login credentials')),
    'El correo o la contraseña no coinciden.',
  );
  assert.equal(
    getAccountErrorMessage(new Error('database internal details')),
    'No pudimos completar la solicitud. Inténtalo de nuevo.',
  );
});

test('las migraciones fuerzan RLS y no conceden lectura anónima', async () => {
  const [profiles, consents, audit] = await Promise.all([
    readFile(new URL('../supabase/migrations/0001_profiles.sql', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/migrations/0002_consents.sql', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/tests/rls.sql', import.meta.url), 'utf8'),
  ]);

  for (const migration of [profiles, consents]) {
    assert.match(migration, /enable row level security/i);
    assert.match(migration, /force row level security/i);
    assert.match(migration, /revoke all .* from anon, authenticated/i);
    assert.match(migration, /auth\.uid\(\)/i);
  }

  assert.doesNotMatch(profiles, /emotion_text|reflection_text|prompt/i);
  assert.doesNotMatch(consents, /emotion_text|reflection_text|prompt/i);
  assert.match(audit, /anon no debe tener SELECT/i);
});
