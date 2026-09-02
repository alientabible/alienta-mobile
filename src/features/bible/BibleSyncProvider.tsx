import { useSQLiteContext } from 'expo-sqlite';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';

import { getSupabaseClient } from '@/core/api/supabase';
import { useAuth } from '@/core/auth/AuthProvider';
import { synchronizeBibleData } from '@/features/bible/sync';
import { subscribeToBibleLocalChanges } from '@/features/bible/syncEvents';

export type BibleSyncStatus = 'disabled' | 'error' | 'synced' | 'syncing';

type BibleSyncContextValue = {
  revision: number;
  status: BibleSyncStatus;
  synchronizeNow: () => void;
};

const BibleSyncContext = createContext<BibleSyncContextValue | null>(null);
const SYNC_INTERVAL_MS = 30_000;
const LOCAL_CHANGE_DEBOUNCE_MS = 500;

export function BibleSyncProvider({ children }: PropsWithChildren) {
  const database = useSQLiteContext();
  const { bibleSyncConsent, session } = useAuth();
  const supabase = getSupabaseClient();
  const userId = session?.user.id ?? null;
  const eligible = Boolean(supabase && userId && bibleSyncConsent);
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState<BibleSyncStatus>('disabled');
  const runningRef = useRef(false);
  const queuedRef = useRef(false);
  const runRef = useRef<() => void>(() => undefined);

  const runSync = useCallback(async () => {
    if (!supabase || !userId || !bibleSyncConsent) {
      setStatus('disabled');
      return;
    }
    if (runningRef.current) {
      queuedRef.current = true;
      return;
    }

    runningRef.current = true;
    setStatus('syncing');
    try {
      const result = await synchronizeBibleData(database, supabase, userId);
      if (result.localChanged) setRevision((current) => current + 1);
      setStatus('synced');
    } catch {
      setStatus('error');
    } finally {
      runningRef.current = false;
      if (queuedRef.current) {
        queuedRef.current = false;
        setTimeout(() => runRef.current(), 0);
      }
    }
  }, [bibleSyncConsent, database, supabase, userId]);

  useEffect(() => {
    runRef.current = () => {
      void runSync();
    };
  }, [runSync]);

  useEffect(() => {
    if (!eligible) {
      queuedRef.current = false;
      return undefined;
    }

    let localChangeTimer: ReturnType<typeof setTimeout> | null = null;
    const requestSync = () => runRef.current();
    const unsubscribeLocalChanges = subscribeToBibleLocalChanges(() => {
      if (localChangeTimer) clearTimeout(localChangeTimer);
      localChangeTimer = setTimeout(requestSync, LOCAL_CHANGE_DEBOUNCE_MS);
    });
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') requestSync();
    });
    const interval = setInterval(requestSync, SYNC_INTERVAL_MS);

    const handleWebActivity = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') requestSync();
    };
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('focus', handleWebActivity);
      window.addEventListener('online', handleWebActivity);
      document.addEventListener('visibilitychange', handleWebActivity);
    }

    requestSync();
    return () => {
      unsubscribeLocalChanges();
      appStateSubscription.remove();
      clearInterval(interval);
      if (localChangeTimer) clearTimeout(localChangeTimer);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('focus', handleWebActivity);
        window.removeEventListener('online', handleWebActivity);
        document.removeEventListener('visibilitychange', handleWebActivity);
      }
    };
  }, [eligible]);

  const value = useMemo<BibleSyncContextValue>(
    () => ({
      revision,
      status: eligible ? status : 'disabled',
      synchronizeNow: () => runRef.current(),
    }),
    [eligible, revision, status],
  );

  return <BibleSyncContext.Provider value={value}>{children}</BibleSyncContext.Provider>;
}

export function useBibleSync() {
  const context = useOptionalBibleSync();
  if (!context) throw new Error('useBibleSync must be used inside BibleSyncProvider');
  return context;
}

export function useOptionalBibleSync() {
  return useContext(BibleSyncContext);
}
