import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import i18n from '@/i18n';

import {
  createCompletedOnboarding,
  createInitialOnboardingAnswers,
  type OnboardingAnswers,
  ONBOARDING_STORAGE_KEY,
  parseStoredOnboarding,
  type ReminderPreference,
} from './model';

type OnboardingContextValue = {
  answers: OnboardingAnswers;
  completed: boolean;
  complete: (answers: OnboardingAnswers) => Promise<void>;
  ready: boolean;
  reset: () => Promise<void>;
  updateReminder: (reminder: ReminderPreference) => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState(createInitialOnboardingAnswers);

  useEffect(() => {
    let mounted = true;

    void AsyncStorage.getItem(ONBOARDING_STORAGE_KEY)
      .then((value) => {
        if (!mounted) return;
        const stored = parseStoredOnboarding(value);
        if (!stored) return;
        setAnswers(stored.answers);
        setCompleted(stored.completed);
        void i18n.changeLanguage(stored.answers.language);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const complete = useCallback(async (nextAnswers: OnboardingAnswers) => {
    const stored = createCompletedOnboarding(nextAnswers);
    setAnswers(nextAnswers);
    setCompleted(true);
    void i18n.changeLanguage(nextAnswers.language);
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(stored)).catch(
      () => undefined,
    );
  }, []);

  const reset = useCallback(async () => {
    const initial = createInitialOnboardingAnswers();
    setAnswers(initial);
    setCompleted(false);
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY).catch(() => undefined);
  }, []);

  const updateReminder = useCallback(
    async (reminder: ReminderPreference) => {
      const nextAnswers = { ...answers, reminder };
      setAnswers(nextAnswers);

      if (!completed) return;
      const current = parseStoredOnboarding(
        await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY).catch(() => null),
      );
      await AsyncStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify(createCompletedOnboarding(nextAnswers, current?.completedAt)),
      ).catch(() => undefined);
    },
    [answers, completed],
  );

  const value = useMemo<OnboardingContextValue>(
    () => ({ answers, completed, complete, ready, reset, updateReminder }),
    [answers, complete, completed, ready, reset, updateReminder],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
}
