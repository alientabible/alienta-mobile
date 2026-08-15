import { useTranslation } from 'react-i18next';

import { FeaturePlaceholder } from '@/components/FeaturePlaceholder';

export default function BibleScreen() {
  const { t } = useTranslation();
  const items = t('features.bible.items', { returnObjects: true }) as string[];

  return (
    <FeaturePlaceholder
      description={t('features.bible.description')}
      eyebrow={t('features.comingSoon')}
      items={items}
      title={t('features.bible.title')}
    />
  );
}
