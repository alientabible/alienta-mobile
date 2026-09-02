import {
  AppState,
  type AppStateStatus,
} from 'react-native';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ReadingRhythm,
  ReminderPreference,
} from '@/features/onboarding/model';
import { useOnboarding } from '@/features/onboarding/OnboardingProvider';

import {
  activateReadingReminders,
  configureReadingNotificationHandler,
  disableReadingReminders,
  reconcileReadingReminders,
  type ReadingReminderStatus,
} from './notifications';

type ReadingReminderContextValue = {
  activate: (
    preference?: ReminderPreference,
    rhythm?: ReadingRhythm,
  ) => Promise<ReadingReminderStatus>;
  busy: boolean;
  disable: () => Promise<ReadingReminderStatus>;
  refresh: () => Promise<ReadingReminderStatus>;
  status: ReadingReminderStatus;
};

const ReadingReminderContext = createContext<ReadingReminderContextValue | null>(null);

export function ReadingReminderProvider({ children }: PropsWithChildren) {
  const { answers, completed, ready } = useOnboarding();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<ReadingReminderStatus>('inactive');

  useEffect(() => {
    configureReadingNotificationHandler();
  }, []);

  const refresh = useCallback(async () => {
    if (!ready || !completed) return 'inactive';

    setBusy(true);
    try {
      const nextStatus = await reconcileReadingReminders(
        answers.reminder,
        answers.rhythm,
      );
      setStatus(nextStatus);
      return nextStatus;
    } catch {
      setStatus('error');
      return 'error';
    } finally {
      setBusy(false);
    }
  }, [answers.reminder, answers.rhythm, completed, ready]);

  useEffect(() => {
    const refreshTimer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(refreshTimer);
  }, [refresh]);

  useEffect(() => {
    function handleAppState(nextState: AppStateStatus) {
      if (nextState === 'active') void refresh();
    }

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [refresh]);

  const activate = useCallback(
    async (
      preference = answers.reminder,
      rhythm = answers.rhythm,
    ): Promise<ReadingReminderStatus> => {
      setBusy(true);
      try {
        const nextStatus = await activateReadingReminders(preference, rhythm);
        setStatus(nextStatus);
        return nextStatus;
      } catch {
        setStatus('error');
        return 'error';
      } finally {
        setBusy(false);
      }
    },
    [answers.reminder, answers.rhythm],
  );

  const disable = useCallback(async (): Promise<ReadingReminderStatus> => {
    setBusy(true);
    try {
      const nextStatus = await disableReadingReminders();
      setStatus(nextStatus);
      return nextStatus;
    } catch {
      setStatus('error');
      return 'error';
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo<ReadingReminderContextValue>(
    () => ({ activate, busy, disable, refresh, status }),
    [activate, busy, disable, refresh, status],
  );

  return (
    <ReadingReminderContext.Provider value={value}>
      {children}
    </ReadingReminderContext.Provider>
  );
}

export function useReadingReminder() {
  const context = useContext(ReadingReminderContext);
  if (!context) {
    throw new Error('useReadingReminder must be used inside ReadingReminderProvider');
  }
  return context;
}
