export type EmotionId = 'peace' | 'grateful' | 'lonely' | 'hopeful';

export type CheckInInput = {
  emotion: EmotionId | null;
  note: string;
};
