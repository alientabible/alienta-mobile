import { useTranslation } from 'react-i18next';

import { FeaturePlaceholder } from '@/components/FeaturePlaceholder';

export default function CommunitiesScreen() {
  const { t } = useTranslation();
  const items = t('features.communities.items', { returnObjects: true }) as string[];

  return (
    <FeaturePlaceholder
      description={t('features.communities.description')}
      eyebrow={t('features.comingSoon')}
      items={items}
      title={t('features.communities.title')}
    />
  );
}
