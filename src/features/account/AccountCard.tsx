import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import {
  getAccountErrorMessage,
  validateAccountEmail,
  validateAccountForm,
} from '@/core/auth/authValidation';
import { useAuth } from '@/core/auth/AuthProvider';
import { useBibleSync } from '@/features/bible/BibleSyncProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

type FormMode = 'recover' | 'signIn' | 'signUp';

export function AccountCard() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'profile');
  const { status: bibleSyncStatus } = useBibleSync();
  const {
    bibleSyncConsent,
    configurationStatus,
    initializing,
    requestPasswordReset,
    session,
    setBibleSyncConsent,
    signIn,
    signOut,
    signUp,
  } = useAuth();
  const [mode, setMode] = useState<FormMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedAccountTerms, setAcceptedAccountTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const formErrors = useMemo(() => validateAccountForm(email, password), [email, password]);
  const formValid = !formErrors.email && !formErrors.password;
  const bibleSyncStatusLabel = bibleSyncConsent
    ? t(
        bibleSyncStatus === 'syncing'
          ? 'profile.account.syncStatusSyncing'
          : bibleSyncStatus === 'error'
            ? 'profile.account.syncStatusError'
            : bibleSyncStatus === 'synced'
              ? 'profile.account.syncStatusSynced'
              : 'profile.account.syncStatusWaiting',
      )
    : null;

  function selectMode(nextMode: FormMode) {
    setMode(nextMode);
    setFeedback(null);
    setPassword('');
  }

  async function handleSubmit() {
    if (!formValid || (mode === 'signUp' && !acceptedAccountTerms)) {
      setFeedback(
        mode === 'signUp' && !acceptedAccountTerms
          ? t('profile.account.acceptRequired')
          : formErrors.email ?? formErrors.password ?? null,
      );
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      if (mode === 'signIn') {
        await signIn(email, password);
      } else {
        const result = await signUp(email, password);
        if (result.confirmationRequired) {
          setFeedback(t('profile.account.confirmEmail'));
          setMode('signIn');
          setPassword('');
        }
      }
    } catch (error) {
      setFeedback(getAccountErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordReset() {
    const emailError = validateAccountEmail(email);
    if (emailError) {
      setFeedback(emailError);
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await requestPasswordReset(email);
      setFeedback(t('profile.account.recoverySent'));
    } catch (error) {
      setFeedback(getAccountErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    setFeedback(null);
    try {
      await signOut();
    } catch (error) {
      setFeedback(getAccountErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncConsent(granted: boolean) {
    setBusy(true);
    setFeedback(null);
    try {
      await setBibleSyncConsent(granted);
      setFeedback(
        granted
          ? t('profile.account.syncGranted')
          : t('profile.account.syncRevoked'),
      );
    } catch (error) {
      setFeedback(getAccountErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
        getPremiumDepth(theme, 'raised'),
      ]}
    >
      <View style={styles.titleRow}>
        <View style={[styles.icon, { backgroundColor: palette.soft }]}>
          <AppIcon
            name={{ android: 'shield_person', ios: 'person.badge.shield.checkmark' }}
            size={22}
            tintColor={palette.accent}
            type="monochrome"
          />
        </View>
        <View style={styles.titleCopy}>
          <AppText style={styles.title}>{t('profile.account.cardTitle')}</AppText>
          <AppText color="textMuted" style={styles.subtitle} variant="caption">
            {t('profile.account.cardDescription')}
          </AppText>
        </View>
      </View>

      {initializing ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={palette.accent} />
          <AppText color="textMuted" variant="caption">
            {t('profile.account.loading')}
          </AppText>
        </View>
      ) : null}

      {!initializing && configurationStatus !== 'ready' ? (
        <View style={[styles.statusBox, { backgroundColor: palette.soft }]}>
          <AppText style={styles.statusTitle}>{t('profile.account.guestTitle')}</AppText>
          <AppText color="textMuted" style={styles.statusText} variant="caption">
            {t('profile.account.guestDescription')}
          </AppText>
        </View>
      ) : null}

      {!initializing && configurationStatus === 'ready' && !session ? (
        <View style={styles.form}>
          {mode === 'recover' ? (
            <View style={[styles.recoveryIntro, { backgroundColor: palette.soft }]}>
              <AppText style={styles.statusTitle}>{t('profile.account.recoveryTitle')}</AppText>
              <AppText color="textMuted" style={styles.statusText} variant="caption">
                {t('profile.account.recoveryDescription')}
              </AppText>
            </View>
          ) : (
            <View style={[styles.segmented, { backgroundColor: theme.colors.surface }]}>
              {(['signIn', 'signUp'] as const).map((option) => {
                const selected = mode === option;
                return (
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    key={option}
                    onPress={() => selectMode(option)}
                    style={[
                      styles.segment,
                      selected && { backgroundColor: palette.soft },
                    ]}
                  >
                    <AppText
                      color={selected ? 'text' : 'textMuted'}
                      style={styles.segmentLabel}
                      variant="caption"
                    >
                      {option === 'signIn'
                        ? t('profile.account.signInTab')
                        : t('profile.account.signUpTab')}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.fieldGroup}>
            <AppText style={styles.fieldLabel} variant="caption">
              {t('profile.account.emailLabel')}
            </AppText>
            <TextInput
              accessibilityLabel={t('profile.account.emailLabel')}
              autoCapitalize="none"
              autoComplete="email"
              inputMode="email"
              onChangeText={setEmail}
              placeholder={t('profile.account.emailPlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                  color: theme.colors.text,
                },
              ]}
              value={email}
            />
          </View>

          {mode !== 'recover' ? (
            <View style={styles.fieldGroup}>
              <AppText style={styles.fieldLabel} variant="caption">
                {t('profile.account.passwordLabel')}
              </AppText>
              <TextInput
                accessibilityLabel={t('profile.account.passwordLabel')}
                autoCapitalize="none"
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                onChangeText={setPassword}
                placeholder={t('profile.account.passwordPlaceholder')}
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.outline,
                    color: theme.colors.text,
                  },
                ]}
                value={password}
              />
            </View>
          ) : null}

          {mode === 'signIn' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => selectMode('recover')}
              style={styles.textAction}
            >
              <AppText style={[styles.textActionLabel, { color: palette.accent }]} variant="caption">
                {t('profile.account.forgotPassword')}
              </AppText>
            </Pressable>
          ) : null}

          {mode === 'signUp' ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedAccountTerms }}
              onPress={() => setAcceptedAccountTerms((current) => !current)}
              style={styles.consentRow}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: acceptedAccountTerms ? palette.accent : 'transparent',
                    borderColor: acceptedAccountTerms ? palette.accent : theme.colors.outline,
                  },
                ]}
              >
                {acceptedAccountTerms ? (
                  <AppIcon
                    name={{ android: 'check', ios: 'checkmark' }}
                    size={15}
                    tintColor={palette.onAccent}
                    type="monochrome"
                  />
                ) : null}
              </View>
              <AppText color="textMuted" style={styles.consentText} variant="caption">
                {t('profile.account.accountConsent')}
              </AppText>
            </Pressable>
          ) : null}

          <AppButton
            disabled={busy}
            label={
              busy
                ? t('profile.account.processing')
                : mode === 'recover'
                  ? t('profile.account.recoveryAction')
                  : mode === 'signIn'
                  ? t('profile.account.signInAction')
                  : t('profile.account.signUpAction')
            }
            onPress={() => void (mode === 'recover' ? handlePasswordReset() : handleSubmit())}
          />

          {mode === 'recover' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => selectMode('signIn')}
              style={styles.textAction}
            >
              <AppText style={[styles.textActionLabel, { color: palette.accent }]} variant="caption">
                {t('profile.account.backToSignIn')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!initializing && session ? (
        <View style={styles.sessionContent}>
          <View style={[styles.statusBox, { backgroundColor: palette.soft }]}>
            <AppText style={styles.statusTitle}>{t('profile.account.sessionTitle')}</AppText>
            <AppText color="textMuted" style={styles.statusText} variant="caption">
              {session.user.email ?? 'Cuenta de Alienta'}
            </AppText>
          </View>

          <View style={styles.syncRow}>
            <View style={styles.syncCopy}>
              <AppText style={styles.syncTitle}>{t('profile.account.syncTitle')}</AppText>
              <AppText color="textMuted" style={styles.statusText} variant="caption">
                {t('profile.account.syncDescription')}
              </AppText>
              {bibleSyncStatusLabel ? (
                <AppText
                  accessibilityLiveRegion="polite"
                  style={[styles.syncStatus, { color: palette.accent }]}
                  variant="caption"
                >
                  {bibleSyncStatusLabel}
                </AppText>
              ) : null}
            </View>
            <Switch
              accessibilityLabel={t('profile.account.syncTitle')}
              disabled={busy}
              ios_backgroundColor={theme.colors.outline}
              onValueChange={(value) => void handleSyncConsent(value)}
              thumbColor={bibleSyncConsent ? palette.onAccent : theme.colors.surfaceElevated}
              trackColor={{ false: theme.colors.outline, true: palette.accent }}
              value={bibleSyncConsent}
            />
          </View>

          <AppButton
            disabled={busy}
            label={busy ? t('profile.account.processing') : t('profile.account.signOutAction')}
            onPress={() => void handleSignOut()}
            variant="secondary"
          />
        </View>
      ) : null}

      {feedback ? (
        <AppText accessibilityLiveRegion="polite" color="textMuted" style={styles.feedback} variant="caption">
          {feedback}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 16,
    padding: 18,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  titleCopy: {
    flex: 1,
    marginLeft: 13,
  },
  title: {
    fontFamily: fonts.sansSemibold,
    fontSize: 15,
    lineHeight: 21,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  statusBox: {
    borderRadius: 17,
    marginTop: 18,
    padding: 14,
  },
  statusTitle: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    lineHeight: 19,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  form: {
    gap: 15,
    marginTop: 18,
  },
  segmented: {
    borderRadius: 15,
    flexDirection: 'row',
    padding: 4,
  },
  recoveryIntro: {
    borderRadius: 15,
    padding: 14,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  segmentLabel: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
  },
  input: {
    borderRadius: 15,
    borderWidth: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  consentRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginTop: 1,
    width: 24,
  },
  consentText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },
  sessionContent: {
    gap: 16,
  },
  syncRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginTop: 2,
  },
  syncCopy: {
    flex: 1,
  },
  syncStatus: {
    marginTop: 6,
  },
  syncTitle: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    lineHeight: 19,
  },
  feedback: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
  },
  textAction: {
    alignSelf: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  textActionLabel: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
  },
});
