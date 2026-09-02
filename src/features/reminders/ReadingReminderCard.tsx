import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { useOnboarding } from '@/features/onboarding/OnboardingProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPremiumDepth } from '@/theme/effects';
import { fonts, getSectionPalette } from '@/theme/tokens';

import { formatReminderTime } from './model';
import { openReadingNotificationSettings } from './notifications';
import { useReadingReminder } from './ReadingReminderProvider';

export function ReadingReminderCard() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const palette = getSectionPalette(theme, 'profile');
  const { answers, updateReminder } = useOnboarding();
  const { activate, busy, disable, status } = useReadingReminder();
  const rhythm = answers.rhythm;
  const canSchedule = Boolean(rhythm && rhythm !== 'later');
  const isScheduled = status === 'scheduled';
  const switchDisabled = busy || !canSchedule || status === 'unsupported';

  async function changeEnabled(enabled: boolean) {
    if (enabled) {
      const nextPreference = { ...answers.reminder, enabled: true };
      const nextStatus = await activate(nextPreference, rhythm);
      if (
        nextStatus === 'scheduled' ||
        nextStatus === 'blocked' ||
        nextStatus === 'needs-permission'
      ) {
        await updateReminder(nextPreference);
      }
      return;
    }

    await disable();
    await updateReminder({ ...answers.reminder, enabled: false });
  }

  const statusKey =
    status === 'scheduled'
      ? 'profile.reminders.statusScheduled'
      : status === 'blocked'
        ? 'profile.reminders.statusBlocked'
        : status === 'needs-permission'
          ? 'profile.reminders.statusNeedsPermission'
          : status === 'unsupported'
            ? 'profile.reminders.statusUnsupported'
            : status === 'error'
              ? 'profile.reminders.statusError'
              : 'profile.reminders.statusInactive';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.outline },
        getPremiumDepth(theme, 'raised'),
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: palette.soft }]}>
          <AppIcon
            name={{ android: 'notifications_none', ios: 'bell' }}
            size={22}
            tintColor={palette.accent}
            type="monochrome"
          />
        </View>
        <View style={styles.copy}>
          <AppText style={styles.title}>{t('profile.reminders.title')}</AppText>
          <AppText color="textMuted" style={styles.description} variant="caption">
            {t('profile.reminders.description')}
          </AppText>
        </View>
        <Switch
          accessibilityLabel={t('profile.reminders.title')}
          accessibilityState={{ busy, checked: isScheduled, disabled: switchDisabled }}
          disabled={switchDisabled}
          ios_backgroundColor={theme.colors.outline}
          onValueChange={(enabled) => void changeEnabled(enabled)}
          thumbColor={isScheduled ? theme.colors.onPrimary : theme.colors.surfaceElevated}
          trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
          value={isScheduled}
        />
      </View>

      <View style={[styles.summary, { backgroundColor: palette.soft }]}>
        <View style={styles.summaryCopy}>
          <AppText style={styles.summaryTitle} variant="caption">
            {canSchedule
              ? t(`profile.reminders.rhythm.${rhythm}`)
              : t('profile.reminders.rhythm.later')}
          </AppText>
          <AppText color="textMuted" style={styles.summaryValue} variant="caption">
            {canSchedule
              ? t('profile.reminders.atTime', {
                  time: formatReminderTime(answers.reminder),
                })
              : t('profile.reminders.chooseRhythm')}
          </AppText>
        </View>
        <AppText
          color="textMuted"
          style={[
            styles.status,
            (status === 'error' || status === 'blocked') && { color: palette.accent },
          ]}
          variant="caption"
        >
          {busy ? t('profile.reminders.statusLoading') : t(statusKey)}
        </AppText>
      </View>

      <View style={styles.privacyRow}>
        <AppIcon
          name={{ android: 'phonelink_lock', ios: 'iphone.and.arrow.forward' }}
          size={17}
          tintColor={theme.colors.textMuted}
          type="monochrome"
        />
        <AppText color="textMuted" style={styles.privacy} variant="caption">
          {t('profile.reminders.localOnly')}
        </AppText>
      </View>

      {status === 'blocked' ? (
        <View style={styles.settingsButton}>
          <AppButton
            label={t('profile.reminders.openSettings')}
            onPress={() => void openReadingNotificationSettings()}
            variant="secondary"
          />
        </View>
      ) : null}

      {answers.reminder.enabled && !isScheduled && status !== 'unsupported' ? (
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => void changeEnabled(false)}
          style={({ pressed }) => [
            styles.cancelAction,
            (pressed || busy) && styles.pressed,
          ]}
        >
          <AppText color="textMuted" style={styles.cancelLabel} variant="caption">
            {t('profile.reminders.cancelPending')}
          </AppText>
        </Pressable>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: {
    flex: 1,
    marginHorizontal: 13,
  },
  title: {
    fontFamily: fonts.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
  },
  description: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  summary: {
    alignItems: 'center',
    borderRadius: 17,
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryCopy: {
    flex: 1,
    paddingRight: 10,
  },
  summaryTitle: {
    fontFamily: fonts.sansSemibold,
  },
  summaryValue: {
    marginTop: 2,
  },
  status: {
    fontFamily: fonts.sansSemibold,
    maxWidth: '45%',
    textAlign: 'right',
  },
  privacyRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  privacy: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  settingsButton: {
    marginTop: 16,
  },
  cancelAction: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  cancelLabel: {
    fontFamily: fonts.sansSemibold,
  },
  pressed: {
    opacity: 0.65,
  },
});
