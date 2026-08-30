import type { AppIconName } from '@/components/AppIcon';

import type {
  BibleFamiliarity,
  OnboardingEmotion,
  OnboardingPurpose,
  ReadingRhythm,
} from './model';

export type OnboardingOption<T extends string> = {
  descriptionKey?: string;
  icon: AppIconName;
  id: T;
  labelKey: string;
};

export const purposeOptions: OnboardingOption<OnboardingPurpose>[] = [
  {
    id: 'bible',
    icon: { android: 'menu_book', ios: 'book' },
    labelKey: 'onboarding.purpose.options.bible',
  },
  {
    id: 'daily',
    icon: { android: 'wb_sunny', ios: 'sun.max' },
    labelKey: 'onboarding.purpose.options.daily',
  },
  {
    id: 'faith',
    icon: { android: 'favorite_border', ios: 'heart' },
    labelKey: 'onboarding.purpose.options.faith',
  },
  {
    id: 'calm',
    icon: { android: 'air', ios: 'wind' },
    labelKey: 'onboarding.purpose.options.calm',
  },
  {
    id: 'habit',
    icon: { android: 'calendar_month', ios: 'calendar' },
    labelKey: 'onboarding.purpose.options.habit',
  },
  {
    id: 'unsure',
    icon: { android: 'explore', ios: 'safari' },
    labelKey: 'onboarding.purpose.options.unsure',
  },
];

export const familiarityOptions: OnboardingOption<BibleFamiliarity>[] = [
  {
    descriptionKey: 'onboarding.familiarity.options.newDescription',
    id: 'new',
    icon: { android: 'eco', ios: 'leaf' },
    labelKey: 'onboarding.familiarity.options.new',
  },
  {
    descriptionKey: 'onboarding.familiarity.options.someDescription',
    id: 'some',
    icon: { android: 'auto_stories', ios: 'book.pages' },
    labelKey: 'onboarding.familiarity.options.some',
  },
  {
    descriptionKey: 'onboarding.familiarity.options.familiarDescription',
    id: 'familiar',
    icon: { android: 'local_library', ios: 'books.vertical' },
    labelKey: 'onboarding.familiarity.options.familiar',
  },
];

const calmIcon = { android: 'air', ios: 'wind' } as const;
const brightIcon = { android: 'wb_sunny', ios: 'sun.max' } as const;
const heartIcon = { android: 'favorite_border', ios: 'heart' } as const;
const personIcon = { android: 'person_outline', ios: 'person' } as const;
const cloudIcon = { android: 'cloud', ios: 'cloud' } as const;
const alertIcon = { android: 'warning_amber', ios: 'exclamationmark.triangle' } as const;

export const onboardingEmotionOptions: OnboardingOption<OnboardingEmotion>[] = [
  { id: 'peaceful', icon: calmIcon, labelKey: 'onboarding.emotion.options.peaceful' },
  { id: 'grateful', icon: heartIcon, labelKey: 'onboarding.emotion.options.grateful' },
  { id: 'joyful', icon: brightIcon, labelKey: 'onboarding.emotion.options.joyful' },
  { id: 'hopeful', icon: brightIcon, labelKey: 'onboarding.emotion.options.hopeful' },
  { id: 'motivated', icon: brightIcon, labelKey: 'onboarding.emotion.options.motivated' },
  { id: 'loved', icon: heartIcon, labelKey: 'onboarding.emotion.options.loved' },
  { id: 'curious', icon: personIcon, labelKey: 'onboarding.emotion.options.curious' },
  { id: 'reflective', icon: calmIcon, labelKey: 'onboarding.emotion.options.reflective' },
  { id: 'tired', icon: cloudIcon, labelKey: 'onboarding.emotion.options.tired' },
  { id: 'overwhelmed', icon: alertIcon, labelKey: 'onboarding.emotion.options.overwhelmed' },
  { id: 'anxious', icon: alertIcon, labelKey: 'onboarding.emotion.options.anxious' },
  { id: 'confused', icon: cloudIcon, labelKey: 'onboarding.emotion.options.confused' },
  { id: 'sad', icon: cloudIcon, labelKey: 'onboarding.emotion.options.sad' },
  { id: 'lonely', icon: personIcon, labelKey: 'onboarding.emotion.options.lonely' },
  { id: 'frustrated', icon: alertIcon, labelKey: 'onboarding.emotion.options.frustrated' },
  { id: 'angry', icon: alertIcon, labelKey: 'onboarding.emotion.options.angry' },
  { id: 'afraid', icon: alertIcon, labelKey: 'onboarding.emotion.options.afraid' },
  { id: 'hurt', icon: heartIcon, labelKey: 'onboarding.emotion.options.hurt' },
  { id: 'disappointed', icon: cloudIcon, labelKey: 'onboarding.emotion.options.disappointed' },
  { id: 'guilty', icon: cloudIcon, labelKey: 'onboarding.emotion.options.guilty' },
  { id: 'discouraged', icon: cloudIcon, labelKey: 'onboarding.emotion.options.discouraged' },
  { id: 'disconnected', icon: personIcon, labelKey: 'onboarding.emotion.options.disconnected' },
  { id: 'unknown', icon: calmIcon, labelKey: 'onboarding.emotion.options.unknown' },
];

export const rhythmOptions: OnboardingOption<ReadingRhythm>[] = [
  {
    descriptionKey: 'onboarding.rhythm.options.threeDescription',
    id: 'three',
    icon: { android: 'spa', ios: 'leaf' },
    labelKey: 'onboarding.rhythm.options.three',
  },
  {
    descriptionKey: 'onboarding.rhythm.options.fiveDescription',
    id: 'five',
    icon: { android: 'calendar_month', ios: 'calendar' },
    labelKey: 'onboarding.rhythm.options.five',
  },
  {
    descriptionKey: 'onboarding.rhythm.options.dailyDescription',
    id: 'daily',
    icon: { android: 'wb_sunny', ios: 'sun.max' },
    labelKey: 'onboarding.rhythm.options.daily',
  },
  {
    descriptionKey: 'onboarding.rhythm.options.laterDescription',
    id: 'later',
    icon: { android: 'more_horiz', ios: 'ellipsis' },
    labelKey: 'onboarding.rhythm.options.later',
  },
];
