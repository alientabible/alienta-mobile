import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';

type FeaturePlaceholderProps = {
  description: string;
  eyebrow: string;
  items: string[];
  title: string;
};

export function FeaturePlaceholder(props: FeaturePlaceholderProps) {
  return (
    <Screen>
      <EmptyState {...props} />
    </Screen>
  );
}
