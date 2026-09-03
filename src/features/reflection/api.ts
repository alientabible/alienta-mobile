import type { CheckInInput } from '@/features/check-in/types';

import {
  validateGeneratedReflection,
  validateReflectionRequest,
  type GeneratedReflection,
  type ReflectionRequest,
} from '../../../supabase/functions/generate-reflection/schema.ts';

export type ReflectionTransport = (
  request: ReflectionRequest,
) => Promise<{ data: unknown; approvedVerseIds: readonly string[] }>;

export function prepareReflectionRequest(
  input: CheckInInput,
  processWithAi: boolean,
  countryCode = 'CO',
): ReflectionRequest {
  const candidate = {
    locale: 'es-CO',
    emotion: input.emotion,
    ...(input.note.trim() ? { note: input.note.trim() } : {}),
    countryCode,
    consent: {
      processWithAi,
      storeOriginalText: false,
    },
  };
  const validation = validateReflectionRequest(candidate);
  if (!validation.ok) throw new Error(validation.issues.join('; '));
  return validation.value;
}

export async function requestGeneratedReflection(
  transport: ReflectionTransport,
  request: ReflectionRequest,
): Promise<GeneratedReflection> {
  const requestValidation = validateReflectionRequest(request);
  if (!requestValidation.ok) throw new Error(requestValidation.issues.join('; '));
  const result = await transport(requestValidation.value);
  const responseValidation = validateGeneratedReflection(
    result.data,
    new Set(result.approvedVerseIds),
  );
  if (!responseValidation.ok) throw new Error(responseValidation.issues.join('; '));
  return responseValidation.value;
}
