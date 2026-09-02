export const REFLECTION_LOCALES = ['es-CO'] as const;
export const REFLECTION_EMOTIONS = ['peace', 'grateful', 'lonely', 'hopeful', 'other'] as const;
export const REFLECTION_TOPICS = [
  'peace',
  'gratitude',
  'loneliness',
  'hope',
  'overwhelm',
  'grief',
  'fear',
  'guidance',
  'rest',
] as const;
export const REFLECTION_TONES = ['calm', 'gentle', 'grounded', 'hopeful', 'grateful'] as const;
export const GENERATED_SAFETY_LEVELS = ['standard', 'support'] as const;

export type ReflectionLocale = (typeof REFLECTION_LOCALES)[number];
export type ReflectionEmotion = (typeof REFLECTION_EMOTIONS)[number];
export type ReflectionTopic = (typeof REFLECTION_TOPICS)[number];
export type ReflectionTone = (typeof REFLECTION_TONES)[number];
export type GeneratedSafetyLevel = (typeof GENERATED_SAFETY_LEVELS)[number];

export type ReflectionRequest = {
  locale: ReflectionLocale;
  emotion: ReflectionEmotion | null;
  note?: string;
  countryCode?: string;
  consent: {
    processWithAi: true;
    storeOriginalText: false;
  };
};

export type GeneratedReflection = {
  tone: ReflectionTone;
  title: string;
  passages: Array<{
    verseId: string;
    reason: string;
  }>;
  reflection: string;
  prayer: string;
  nextStep: string;
  safetyLevel: GeneratedSafetyLevel;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: string[] };

const VERSE_ID_PATTERN = /^(rvr1909|webp)\.[1-3A-Z]{3}\.[1-9]\d{0,2}\.[1-9]\d{0,2}$/;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const HTML_PATTERN = /<\/?[a-z][^>]*>/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]) {
  const allowedKeys = new Set(allowed);
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function isOneOf<const T extends readonly string[]>(value: unknown, values: T): value is T[number] {
  return typeof value === 'string' && values.includes(value as T[number]);
}

function isBoundedText(value: unknown, maximum: number) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= maximum &&
    !HTML_PATTERN.test(value)
  );
}

export function validateReflectionRequest(value: unknown): ValidationResult<ReflectionRequest> {
  const issues: string[] = [];
  if (!isRecord(value)) return { ok: false, issues: ['request must be an object'] };
  if (!hasOnlyKeys(value, ['locale', 'emotion', 'note', 'countryCode', 'consent'])) {
    issues.push('request contains unsupported fields');
  }
  if (!isOneOf(value.locale, REFLECTION_LOCALES)) issues.push('locale is not supported');
  if (value.emotion !== null && !isOneOf(value.emotion, REFLECTION_EMOTIONS)) {
    issues.push('emotion is not supported');
  }
  if (value.note !== undefined && (typeof value.note !== 'string' || value.note.length > 1_200)) {
    issues.push('note must contain at most 1200 characters');
  }
  if (
    value.countryCode !== undefined &&
    (typeof value.countryCode !== 'string' || !COUNTRY_CODE_PATTERN.test(value.countryCode))
  ) {
    issues.push('countryCode must be an uppercase ISO alpha-2 code');
  }
  if (!isRecord(value.consent) || !hasOnlyKeys(value.consent, ['processWithAi', 'storeOriginalText'])) {
    issues.push('consent is invalid');
  } else {
    if (value.consent.processWithAi !== true) issues.push('AI processing requires explicit consent');
    if (value.consent.storeOriginalText !== false) issues.push('original text storage is disabled');
  }
  return issues.length === 0
    ? { ok: true, value: value as ReflectionRequest }
    : { ok: false, issues };
}

export function validateGeneratedReflection(
  value: unknown,
  approvedVerseIds: ReadonlySet<string>,
): ValidationResult<GeneratedReflection> {
  const issues: string[] = [];
  if (!isRecord(value)) return { ok: false, issues: ['response must be an object'] };
  if (
    !hasOnlyKeys(value, [
      'tone',
      'title',
      'passages',
      'reflection',
      'prayer',
      'nextStep',
      'safetyLevel',
    ])
  ) {
    issues.push('response contains unsupported fields');
  }
  if (!isOneOf(value.tone, REFLECTION_TONES)) issues.push('tone is invalid');
  if (!isBoundedText(value.title, 100)) issues.push('title is invalid');
  if (!isBoundedText(value.reflection, 900)) issues.push('reflection is invalid');
  if (!isBoundedText(value.prayer, 500)) issues.push('prayer is invalid');
  if (!isBoundedText(value.nextStep, 240)) issues.push('nextStep is invalid');
  if (!isOneOf(value.safetyLevel, GENERATED_SAFETY_LEVELS)) {
    issues.push('safetyLevel is invalid');
  }
  if (!Array.isArray(value.passages) || value.passages.length < 1 || value.passages.length > 3) {
    issues.push('passages must contain between 1 and 3 items');
  } else {
    const seen = new Set<string>();
    value.passages.forEach((passage, index) => {
      if (!isRecord(passage) || !hasOnlyKeys(passage, ['verseId', 'reason'])) {
        issues.push(`passages[${index}] is invalid`);
        return;
      }
      if (
        typeof passage.verseId !== 'string' ||
        !VERSE_ID_PATTERN.test(passage.verseId) ||
        !approvedVerseIds.has(passage.verseId)
      ) {
        issues.push(`passages[${index}].verseId is not approved`);
      } else if (seen.has(passage.verseId)) {
        issues.push(`passages[${index}].verseId is duplicated`);
      } else {
        seen.add(passage.verseId);
      }
      if (!isBoundedText(passage.reason, 240)) {
        issues.push(`passages[${index}].reason is invalid`);
      }
    });
  }
  return issues.length === 0
    ? { ok: true, value: value as GeneratedReflection }
    : { ok: false, issues };
}

export function parseGeneratedReflectionJson(
  json: string,
  approvedVerseIds: ReadonlySet<string>,
): ValidationResult<GeneratedReflection> {
  try {
    return validateGeneratedReflection(JSON.parse(json), approvedVerseIds);
  } catch {
    return { ok: false, issues: ['response is not valid JSON'] };
  }
}
