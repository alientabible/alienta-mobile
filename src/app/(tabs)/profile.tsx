import { useTranslation } from 'react-i18next';

import { FeaturePlaceholder } from '@/components/FeaturePlaceholder';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const items = t('features.profile.items', { returnObjects: true }) as string[];

  return (
    <FeaturePlaceholder
      description={t('features.profile.description')}
      eyebrow={t('features.comingSoon')}
      items={items}
      title={t('features.profile.title')}
    />
  );
}
