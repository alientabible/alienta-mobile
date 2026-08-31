import * as Linking from 'expo-linking';
import { type Href, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { BrandLockup } from '@/components/BrandLockup';
import { Screen } from '@/components/Screen';
import { getAccountErrorMessage, validateNewPassword } from '@/core/auth/authValidation';
import { useAuth } from '@/core/auth/AuthProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

type CallbackState = 'confirmation' | 'error' | 'processing' | 'recovery' | 'updated';

function getCurrentWebUrl() {
  if (Platform.OS !== 'web' || typeof globalThis.location === 'undefined') return null;
  return globalThis.location.href;
}

function removeSensitiveParametersFromAddressBar() {
  if (
    Platform.OS !== 'web' ||
    typeof globalThis.history === 'undefined' ||
    typeof globalThis.location === 'undefined'
  ) {
    return;
  }

  globalThis.history.replaceState(null, '', globalThis.location.pathname);
}

export default function AuthCallbackScreen() {
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'profile');
  const incomingUrl = Linking.useLinkingURL();
  const redirectUrl = incomingUrl ?? getCurrentWebUrl();
  const { completeAuthRedirect, updatePassword } = useAuth();
  const processedUrl = useRef<string | null>(null);
  const [state, setState] = useState<CallbackState>('processing');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!redirectUrl || processedUrl.current === redirectUrl) return;
    processedUrl.current = redirectUrl;

    void completeAuthRedirect(redirectUrl)
      .then(({ kind }) => {
        setState(kind === 'recovery' ? 'recovery' : 'confirmation');
      })
      .catch((error) => {
        setFeedback(getAccountErrorMessage(error));
        setState('error');
      })
      .finally(removeSensitiveParametersFromAddressBar);
  }, [completeAuthRedirect, redirectUrl]);

  const content = useMemo(() => {
    if (state === 'confirmation') {
      return {
        description: 'Tu correo quedó confirmado y la sesión se protegió correctamente.',
        icon: { android: 'verified_user', ios: 'checkmark.shield.fill' } as const,
        title: 'Cuenta confirmada',
      };
    }
    if (state === 'updated') {
      return {
        description: 'Ya puedes usar la nueva contraseña para entrar a Alienta en tus dispositivos.',
        icon: { android: 'verified_user', ios: 'checkmark.shield.fill' } as const,
        title: 'Contraseña actualizada',
      };
    }
    if (state === 'error') {
      return {
        description: feedback ?? 'No pudimos procesar este enlace.',
        icon: { android: 'link_off', ios: 'link.badge.plus' } as const,
        title: 'Este enlace no está disponible',
      };
    }
    if (state === 'recovery') {
      return {
        description: 'Crea una contraseña nueva para recuperar el acceso a tu cuenta.',
        icon: { android: 'lock_reset', ios: 'key.fill' } as const,
        title: 'Protege de nuevo tu cuenta',
      };
    }
    return {
      description: 'Estamos verificando de forma segura el enlace que abriste.',
      icon: { android: 'shield_lock', ios: 'lock.shield.fill' } as const,
      title: 'Preparando tu cuenta',
    };
  }, [feedback, state]);

  async function handlePasswordUpdate() {
    const validationError = validateNewPassword(password, passwordConfirmation);
    if (validationError) {
      setFeedback(validationError);
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await updatePassword(password);
      setPassword('');
      setPasswordConfirmation('');
      setState('updated');
    } catch (error) {
      setFeedback(getAccountErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function continueToProfile() {
    router.replace('/(tabs)/profile' as Href);
  }

  return (
    <Screen contentStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <BrandLockup />
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
          getPremiumDepth(theme, 'floating'),
        ]}
      >
        <View style={[styles.icon, { backgroundColor: palette.soft }]}>
          {state === 'processing' ? (
            <ActivityIndicator color={palette.accent} />
          ) : (
            <AppIcon
              name={content.icon}
              size={28}
              tintColor={palette.accent}
              type="monochrome"
            />
          )}
        </View>
        <AppText accessibilityRole="header" style={styles.title} variant="heading">
          {content.title}
        </AppText>
        <AppText color="textMuted" style={styles.description}>
          {content.description}
        </AppText>

        {state === 'recovery' ? (
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <AppText style={styles.fieldLabel} variant="caption">
                Nueva contraseña
              </AppText>
              <TextInput
                accessibilityLabel="Nueva contraseña"
                autoCapitalize="none"
                autoComplete="new-password"
                onChangeText={setPassword}
                placeholder="Mínimo 8 caracteres"
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
            <View style={styles.fieldGroup}>
              <AppText style={styles.fieldLabel} variant="caption">
                Confirmar contraseña
              </AppText>
              <TextInput
                accessibilityLabel="Confirmar contraseña"
                autoCapitalize="none"
                autoComplete="new-password"
                onChangeText={setPasswordConfirmation}
                placeholder="Escríbela nuevamente"
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
                value={passwordConfirmation}
              />
            </View>
            {feedback ? (
              <AppText accessibilityLiveRegion="polite" color="textMuted" style={styles.feedback} variant="caption">
                {feedback}
              </AppText>
            ) : null}
            <AppButton
              disabled={busy}
              label={busy ? 'Actualizando…' : 'Guardar nueva contraseña'}
              onPress={() => void handlePasswordUpdate()}
            />
          </View>
        ) : null}

        {state === 'confirmation' || state === 'updated' || state === 'error' ? (
          <View style={styles.action}>
            <AppButton
              label={state === 'error' ? 'Volver a Alienta' : 'Continuar en Alienta'}
              onPress={continueToProfile}
              variant={state === 'error' ? 'secondary' : 'primary'}
            />
          </View>
        ) : null}
      </View>
      <AppText color="textMuted" style={styles.privacy} variant="caption">
        Alienta procesa este enlace únicamente para confirmar tu identidad. No mostramos ni guardamos tus credenciales en esta pantalla.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: 28,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 52,
    padding: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  feedback: {
    fontSize: 12,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
  },
  form: {
    gap: 15,
    marginTop: 26,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  input: {
    borderRadius: 15,
    borderWidth: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    minHeight: 54,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  privacy: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 24,
    textAlign: 'center',
  },
  screen: {
    justifyContent: 'center',
    maxWidth: 560,
    paddingBottom: 52,
    paddingTop: 28,
  },
  title: {
    marginTop: 24,
  },
});
