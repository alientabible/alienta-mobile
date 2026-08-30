import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';

import { getSupabaseClient, supabaseConfiguration } from '@/core/api/supabase';

const ACCOUNT_POLICY_VERSION = 'account-pilot-2026-08-30';
const PRIVACY_POLICY_VERSION = 'privacy-pilot-2026-08-30';
const BIBLE_SYNC_POLICY_VERSION = 'bible-sync-2026-08-30';
const PENDING_CONSENT_KEY = 'alienta.pendingAccountConsent';

type SignUpResult = {
  confirmationRequired: boolean;
};

type AuthContextValue = {
  bibleSyncConsent: boolean;
  configurationStatus: typeof supabaseConfiguration.status;
  initializing: boolean;
  session: Session | null;
  setBibleSyncConsent: (granted: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function savePendingConsent(email: string) {
  await AsyncStorage.setItem(
    PENDING_CONSENT_KEY,
    JSON.stringify({ email: email.trim().toLowerCase(), acceptedAt: new Date().toISOString() }),
  );
}

async function hasPendingConsent(email: string | undefined) {
  if (!email) return false;

  const pending = await AsyncStorage.getItem(PENDING_CONSENT_KEY);
  if (!pending) return false;

  try {
    const parsed = JSON.parse(pending) as { email?: string };
    if (parsed.email !== email.trim().toLowerCase()) return false;
    return true;
  } catch {
    await AsyncStorage.removeItem(PENDING_CONSENT_KEY);
    return false;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(Boolean(supabase));
  const [bibleSyncConsent, setBibleSyncConsentState] = useState(false);

  const recordAccountConsent = useCallback(
    async (currentSession: Session) => {
      if (!supabase) return;

      const acceptedPendingConsent = await hasPendingConsent(currentSession.user.email);
      if (!acceptedPendingConsent) return;

      const decidedAt = new Date().toISOString();
      const { error } = await supabase.from('user_consents').upsert([
        {
          decided_at: decidedAt,
          granted: true,
          policy_version: ACCOUNT_POLICY_VERSION,
          purpose: 'account_terms',
          revoked_at: null,
          user_id: currentSession.user.id,
        },
        {
          decided_at: decidedAt,
          granted: true,
          policy_version: PRIVACY_POLICY_VERSION,
          purpose: 'privacy_policy',
          revoked_at: null,
          user_id: currentSession.user.id,
        },
      ]);

      if (error) throw error;
      await AsyncStorage.removeItem(PENDING_CONSENT_KEY);
    },
    [supabase],
  );

  const refreshBibleSyncConsent = useCallback(
    async (currentSession: Session | null) => {
      if (!supabase || !currentSession) {
        setBibleSyncConsentState(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_consents')
        .select('granted')
        .eq('user_id', currentSession.user.id)
        .eq('purpose', 'bible_sync')
        .maybeSingle();

      if (error) throw error;
      setBibleSyncConsentState(data?.granted === true);
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (!mounted) return;
      if (!error) {
        setSession(data.session);
        await refreshBibleSyncConsent(data.session).catch(() => undefined);
      }
      setInitializing(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void refreshBibleSyncConsent(nextSession).catch(() => undefined);
    });

    const appStateSubscription =
      Platform.OS === 'web'
        ? null
        : AppState.addEventListener('change', (state) => {
            if (state === 'active') supabase.auth.startAutoRefresh();
            else supabase.auth.stopAutoRefresh();
          });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
      appStateSubscription?.remove();
    };
  }, [refreshBibleSyncConsent, supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) throw new Error('Supabase is not configured');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;
      if (data.session) await recordAccountConsent(data.session);
    },
    [recordAccountConsent, supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      if (!supabase) throw new Error('Supabase is not configured');

      const normalizedEmail = email.trim().toLowerCase();
      await savePendingConsent(normalizedEmail);

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { locale: 'es-CO' },
        },
      });

      if (error) {
        await AsyncStorage.removeItem(PENDING_CONSENT_KEY);
        throw error;
      }

      if (data.session) await recordAccountConsent(data.session);
      return { confirmationRequired: !data.session };
    },
    [recordAccountConsent, supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [supabase]);

  const setBibleSyncConsent = useCallback(
    async (granted: boolean) => {
      if (!supabase || !session) throw new Error('An account is required');

      const now = new Date().toISOString();
      const { error } = await supabase.from('user_consents').upsert({
        decided_at: now,
        granted,
        policy_version: BIBLE_SYNC_POLICY_VERSION,
        purpose: 'bible_sync',
        revoked_at: granted ? null : now,
        user_id: session.user.id,
      });

      if (error) throw error;
      setBibleSyncConsentState(granted);
    },
    [session, supabase],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      bibleSyncConsent,
      configurationStatus: supabaseConfiguration.status,
      initializing,
      session,
      setBibleSyncConsent,
      signIn,
      signOut,
      signUp,
    }),
    [bibleSyncConsent, initializing, session, setBibleSyncConsent, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
