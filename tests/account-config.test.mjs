import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveSupabaseConfiguration } from '../src/core/api/supabaseConfig.ts';
import {
  getAccountErrorMessage,
  validateAccountEmail,
  validateAccountForm,
  validateNewPassword,
} from '../src/core/auth/authValidation.ts';
import {
  getAuthRedirectError,
  parseAuthRedirectUrl,
} from '../src/core/auth/authRedirect.ts';

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
  assert.equal(validateAccountEmail('persona@ejemplo.com'), undefined);
  assert.equal(validateAccountEmail('correo-invalido'), 'Escribe un correo válido.');
  assert.equal(validateNewPassword('segura123', 'segura123'), undefined);
  assert.equal(validateNewPassword('segura123', 'distinta123'), 'Las contraseñas no coinciden.');
});

test('interpreta retornos de Supabase por fragmento y por PKCE', () => {
  assert.deepEqual(
    parseAuthRedirectUrl(
      'https://alienta.app/auth/callback#access_token=token-a&refresh_token=token-r&type=recovery',
    ),
    {
      accessToken: 'token-a',
      code: null,
      errorCode: null,
      errorDescription: null,
      intent: null,
      refreshToken: 'token-r',
      type: 'recovery',
    },
  );

  assert.equal(
    parseAuthRedirectUrl('alienta://auth/callback?code=pkce-code&intent=recovery').code,
    'pkce-code',
  );
  assert.equal(
    parseAuthRedirectUrl('alienta://auth/callback?code=pkce-code&intent=recovery').intent,
    'recovery',
  );
});

test('detecta errores de enlaces sin exponer tokens', () => {
  const parameters = parseAuthRedirectUrl(
    'https://alienta.app/auth/callback#error=access_denied&error_description=Email%20link%20expired',
  );
  assert.equal(getAuthRedirectError(parameters), 'Email link expired');
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

test('la cuenta del onboarding no exige montar la base bíblica', async () => {
  const [accountCard, syncProvider, rootLayout] = await Promise.all([
    readFile(new URL('../src/features/account/AccountCard.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/features/bible/BibleSyncProvider.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/_layout.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(accountCard, /useOptionalBibleSync\(\)\?\.status \?\? 'disabled'/);
  assert.match(syncProvider, /export function useOptionalBibleSync\(\)/);
  assert.match(rootLayout, /completed \? <DatabaseBackedApp \/> : <OnboardingFlow \/>/);
});

test('las migraciones fuerzan RLS y no conceden lectura anónima', async () => {
  const [profiles, consents, bibleSync, audit] = await Promise.all([
    readFile(new URL('../supabase/migrations/0001_profiles.sql', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/migrations/0002_consents.sql', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/migrations/0003_bible_sync.sql', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/tests/rls.sql', import.meta.url), 'utf8'),
  ]);

  for (const migration of [profiles, consents, bibleSync]) {
    assert.match(migration, /enable row level security/i);
    assert.match(migration, /force row level security/i);
    assert.match(migration, /revoke all .* from anon, authenticated/i);
    assert.match(migration, /auth\.uid\(\)/i);
  }

  assert.doesNotMatch(profiles, /emotion_text|reflection_text|prompt/i);
  assert.doesNotMatch(consents, /emotion_text|reflection_text|prompt/i);
  assert.doesNotMatch(bibleSync, /verse_text|emotion_text|reflection_text|prompt/i);
  assert.match(bibleSync, /favorited boolean not null default true/i);
  assert.match(bibleSync, /purpose = 'bible_sync'/i);
  assert.doesNotMatch(bibleSync, /grant .*delete.* to authenticated/i);
  assert.match(audit, /anon no debe tener SELECT/i);
  assert.match(audit, /6 políticas bíblicas deben exigir consentimiento bible_sync/i);
});
