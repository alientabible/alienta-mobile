import { useTranslation } from 'react-i18next';

import { FeaturePlaceholder } from '@/components/FeaturePlaceholder';

export default function StudiesScreen() {
  const { t } = useTranslation();
  const items = t('features.studies.items', { returnObjects: true }) as string[];

  return (
    <FeaturePlaceholder
      description={t('features.studies.description')}
      eyebrow={t('features.comingSoon')}
      items={items}
      title={t('features.studies.title')}
    />
  );
}
