export type SupabaseConfiguration =
  | {
      status: 'missing';
    }
  | {
      reason: 'invalid-key' | 'invalid-url' | 'partial';
      status: 'invalid';
    }
  | {
      publishableKey: string;
      status: 'ready';
      url: string;
    };

function isPlaceholder(value: string) {
  return /TU_PROYECTO|REEMPLAZAR|YOUR_PROJECT|YOUR_KEY/i.test(value);
}

function isAllowedSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    const localDevelopment =
      url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname);

    return url.protocol === 'https:' || localDevelopment;
  } catch {
    return false;
  }
}

function isPrivilegedKey(value: string) {
  if (value.toLowerCase().startsWith('sb_secret_')) return true;
  if (!value.startsWith('eyJ') || typeof globalThis.atob !== 'function') return false;

  try {
    const payload = value.split('.')[1];
    if (!payload) return false;
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(globalThis.atob(normalizedPayload)) as { role?: string };
    return decoded.role === 'service_role';
  } catch {
    return false;
  }
}

export function resolveSupabaseConfiguration(
  rawUrl: string | undefined,
  rawPublishableKey: string | undefined,
): SupabaseConfiguration {
  const url = rawUrl?.trim() ?? '';
  const publishableKey = rawPublishableKey?.trim() ?? '';

  if (!url && !publishableKey) return { status: 'missing' };
  if (!url || !publishableKey) return { reason: 'partial', status: 'invalid' };
  if (isPlaceholder(url) || !isAllowedSupabaseUrl(url)) {
    return { reason: 'invalid-url', status: 'invalid' };
  }
  if (isPlaceholder(publishableKey) || publishableKey.length < 20 || isPrivilegedKey(publishableKey)) {
    return { reason: 'invalid-key', status: 'invalid' };
  }

  return { publishableKey, status: 'ready', url };
}
