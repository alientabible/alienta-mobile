export const ONBOARDING_STORAGE_KEY = 'alienta.onboarding.v1';
export const ONBOARDING_VERSION = 1;

export type OnboardingLanguage = 'es-CO';
export type OnboardingPurpose =
  | 'bible'
  | 'daily'
  | 'faith'
  | 'calm'
  | 'habit'
  | 'unsure';
export type BibleFamiliarity = 'new' | 'some' | 'familiar';
export type OnboardingEmotion =
  | 'peaceful'
  | 'grateful'
  | 'joyful'
  | 'hopeful'
  | 'motivated'
  | 'loved'
  | 'curious'
  | 'reflective'
  | 'tired'
  | 'overwhelmed'
  | 'anxious'
  | 'confused'
  | 'sad'
  | 'lonely'
  | 'frustrated'
  | 'angry'
  | 'afraid'
  | 'hurt'
  | 'disappointed'
  | 'guilty'
  | 'discouraged'
  | 'disconnected'
  | 'unknown';
export type ReadingRhythm = 'three' | 'five' | 'daily' | 'later';

export type ReminderPreference = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export type OnboardingAnswers = {
  familiarity?: BibleFamiliarity;
  language: OnboardingLanguage;
  emotion?: OnboardingEmotion;
  purpose?: OnboardingPurpose;
  reminder: ReminderPreference;
  rhythm?: ReadingRhythm;
};

export type StoredOnboarding = {
  answers: OnboardingAnswers;
  completed: boolean;
  completedAt?: string;
  version: typeof ONBOARDING_VERSION;
};

const purposes: OnboardingPurpose[] = ['bible', 'daily', 'faith', 'calm', 'habit', 'unsure'];
const familiarities: BibleFamiliarity[] = ['new', 'some', 'familiar'];
const emotions: OnboardingEmotion[] = [
  'peaceful',
  'grateful',
  'joyful',
  'hopeful',
  'motivated',
  'loved',
  'curious',
  'reflective',
  'tired',
  'overwhelmed',
  'anxious',
  'confused',
  'sad',
  'lonely',
  'frustrated',
  'angry',
  'afraid',
  'hurt',
  'disappointed',
  'guilty',
  'discouraged',
  'disconnected',
  'unknown',
];
const rhythms: ReadingRhythm[] = ['three', 'five', 'daily', 'later'];

export function createInitialOnboardingAnswers(): OnboardingAnswers {
  return {
    language: 'es-CO',
    reminder: { enabled: false, hour: 20, minute: 30 },
  };
}

function includes<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && values.includes(value as T);
}

function normalizeReminder(value: unknown): ReminderPreference {
  if (!value || typeof value !== 'object') return { enabled: false, hour: 20, minute: 30 };
  const candidate = value as Partial<ReminderPreference>;
  const hour = Number.isInteger(candidate.hour) ? Number(candidate.hour) : 20;
  const minute = Number.isInteger(candidate.minute) ? Number(candidate.minute) : 30;

  return {
    enabled: candidate.enabled === true,
    hour: Math.min(23, Math.max(0, hour)),
    minute: Math.min(59, Math.max(0, minute)),
  };
}

export function parseStoredOnboarding(value: string | null): StoredOnboarding | null {
  if (!value) return null;

  try {
    const candidate = JSON.parse(value) as Partial<StoredOnboarding>;
    if (candidate.version !== ONBOARDING_VERSION || !candidate.answers) return null;

    const answers = candidate.answers as Partial<OnboardingAnswers>;
    return {
      answers: {
        language: 'es-CO',
        reminder: normalizeReminder(answers.reminder),
        ...(includes(purposes, answers.purpose) ? { purpose: answers.purpose } : {}),
        ...(includes(familiarities, answers.familiarity)
          ? { familiarity: answers.familiarity }
          : {}),
        ...(includes(emotions, answers.emotion) ? { emotion: answers.emotion } : {}),
        ...(includes(rhythms, answers.rhythm) ? { rhythm: answers.rhythm } : {}),
      },
      completed: candidate.completed === true,
      ...(typeof candidate.completedAt === 'string'
        ? { completedAt: candidate.completedAt }
        : {}),
      version: ONBOARDING_VERSION,
    };
  } catch {
    return null;
  }
}

export function createCompletedOnboarding(
  answers: OnboardingAnswers,
  completedAt = new Date().toISOString(),
): StoredOnboarding {
  return {
    answers,
    completed: true,
    completedAt,
    version: ONBOARDING_VERSION,
  };
}
