import type { EmotionId } from '../check-in/types';

export type StandardReflectionId = EmotionId | 'other';
export type ReflectionId = StandardReflectionId | 'urgent';

export type MockReflection = {
  action: string;
  eyebrow: string;
  id: StandardReflectionId;
  prayer: string;
  reference: string;
  reflection: string;
  title: string;
  verse: string;
};
