export type AuthRedirectParameters = {
  accessToken: string | null;
  code: string | null;
  errorCode: string | null;
  errorDescription: string | null;
  intent: string | null;
  refreshToken: string | null;
  type: string | null;
};

function readParameter(
  query: URLSearchParams,
  fragment: URLSearchParams,
  name: string,
) {
  return fragment.get(name) ?? query.get(name);
}

/**
 * Supabase's implicit flow returns tokens in the URL fragment, while PKCE
 * returns a code in the query string. Supporting both keeps old email links
 * usable and lets the project migrate flow types without changing the screen.
 */
export function parseAuthRedirectUrl(url: string): AuthRedirectParameters {
  const parsed = new URL(url);
  const query = parsed.searchParams;
  const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ''));

  return {
    accessToken: readParameter(query, fragment, 'access_token'),
    code: readParameter(query, fragment, 'code'),
    errorCode: readParameter(query, fragment, 'error_code') ?? readParameter(query, fragment, 'error'),
    errorDescription: readParameter(query, fragment, 'error_description'),
    intent: readParameter(query, fragment, 'intent'),
    refreshToken: readParameter(query, fragment, 'refresh_token'),
    type: readParameter(query, fragment, 'type'),
  };
}

export function getAuthRedirectError(parameters: AuthRedirectParameters) {
  if (!parameters.errorCode && !parameters.errorDescription) return null;

  return parameters.errorDescription ?? parameters.errorCode ?? 'auth_redirect_error';
}
