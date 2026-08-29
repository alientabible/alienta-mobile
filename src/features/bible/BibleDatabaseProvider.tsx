import { SQLiteProvider } from 'expo-sqlite';
import { useCallback, type PropsWithChildren } from 'react';

import { initializeBibleDatabase } from '@/features/bible/repository';

const bibleDatabaseAsset = require('../../../assets/data/alienta-bible.db');

type BibleDatabaseProviderProps = PropsWithChildren<{
  onReady?: () => void;
}>;

export function BibleDatabaseProvider({ children, onReady }: BibleDatabaseProviderProps) {
  const initialize = useCallback(
    async (database: Parameters<typeof initializeBibleDatabase>[0]) => {
      await initializeBibleDatabase(database);
      onReady?.();
    },
    [onReady],
  );

  return (
    <SQLiteProvider
      assetSource={{ assetId: bibleDatabaseAsset }}
      databaseName="alienta-bible.db"
      onInit={initialize}
    >
      {children}
    </SQLiteProvider>
  );
}
