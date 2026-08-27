import type { AppIconName } from '@/components/AppIcon';

import type { EmotionId } from './types';

export type EmotionOption = {
  icon: AppIconName;
  id: EmotionId;
  labelKey: `home.suggestions.${EmotionId}`;
};

export const emotionOptions: EmotionOption[] = [
  {
    id: 'peace',
    icon: { android: 'air', ios: 'wind' },
    labelKey: 'home.suggestions.peace',
  },
  {
    id: 'grateful',
    icon: { android: 'favorite_border', ios: 'heart' },
    labelKey: 'home.suggestions.grateful',
  },
  {
    id: 'lonely',
    icon: { android: 'person_outline', ios: 'person' },
    labelKey: 'home.suggestions.lonely',
  },
  {
    id: 'hopeful',
    icon: { android: 'wb_sunny', ios: 'sun.max' },
    labelKey: 'home.suggestions.hopeful',
  },
];
