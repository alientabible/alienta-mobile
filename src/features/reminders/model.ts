import type {
  ReadingRhythm,
  ReminderPreference,
} from '@/features/onboarding/model';

export const READING_REMINDER_KIND = 'reading-reminder';

export const READING_REMINDER_CONTENT = {
  body: 'Tu espacio de lectura está disponible cuando quieras volver.',
  title: 'Un momento para leer',
} as const;

export type ReadingReminderSchedule = {
  frequency: 'daily' | 'weekly';
  hour: number;
  minute: number;
  weekday?: number;
};

const weeklyDays: Record<'five' | 'three', number[]> = {
  five: [2, 3, 4, 5, 6],
  three: [2, 4, 7],
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, Math.trunc(value)));
}

export function createReadingReminderSchedule(
  preference: ReminderPreference,
  rhythm?: ReadingRhythm,
): ReadingReminderSchedule[] {
  if (!preference.enabled || !rhythm || rhythm === 'later') return [];

  const hour = clamp(preference.hour, 0, 23);
  const minute = clamp(preference.minute, 0, 59);

  if (rhythm === 'daily') {
    return [{ frequency: 'daily', hour, minute }];
  }

  return weeklyDays[rhythm].map((weekday) => ({
    frequency: 'weekly',
    hour,
    minute,
    weekday,
  }));
}

export function formatReminderTime(preference: ReminderPreference) {
  return `${String(clamp(preference.hour, 0, 23)).padStart(2, '0')}:${String(
    clamp(preference.minute, 0, 59),
  ).padStart(2, '0')}`;
}
