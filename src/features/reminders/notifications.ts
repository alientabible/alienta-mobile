import { Linking, Platform } from 'react-native';

import type {
  ReadingRhythm,
  ReminderPreference,
} from '@/features/onboarding/model';

import {
  createReadingReminderSchedule,
  READING_REMINDER_CONTENT,
  READING_REMINDER_KIND,
} from './model';

export type ReadingReminderStatus =
  | 'blocked'
  | 'error'
  | 'inactive'
  | 'needs-permission'
  | 'scheduled'
  | 'unsupported';

type PermissionResponse = {
  canAskAgain?: boolean;
  granted?: boolean;
  ios?: { status?: number };
  status?: string;
};

type ScheduledNotification = {
  identifier: string;
  content?: { data?: Record<string, unknown> };
};

type NotificationsModule = {
  AndroidImportance: { DEFAULT: number };
  IosAuthorizationStatus?: {
    AUTHORIZED?: number;
    EPHEMERAL?: number;
    PROVISIONAL?: number;
  };
  SchedulableTriggerInputTypes: {
    DAILY: string;
    WEEKLY: string;
  };
  cancelScheduledNotificationAsync: (identifier: string) => Promise<void>;
  getAllScheduledNotificationsAsync: () => Promise<ScheduledNotification[]>;
  getPermissionsAsync: () => Promise<PermissionResponse>;
  requestPermissionsAsync: (permissions?: {
    ios?: { allowAlert?: boolean; allowBadge?: boolean; allowSound?: boolean };
  }) => Promise<PermissionResponse>;
  scheduleNotificationAsync: (request: {
    content: {
      body: string;
      data: Record<string, unknown>;
      sound: boolean;
      title: string;
    };
    trigger: Record<string, unknown>;
  }) => Promise<string>;
  setNotificationChannelAsync: (
    channelId: string,
    channel: { importance: number; name: string; sound: null },
  ) => Promise<unknown>;
  setNotificationHandler: (handler: {
    handleNotification: () => Promise<{
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
      shouldShowBanner: boolean;
      shouldShowList: boolean;
    }>;
  }) => void;
};

const CHANNEL_ID = 'reading-reminders';
let handlerConfigured = false;

function getNotifications(): NotificationsModule | null {
  if (Platform.OS === 'web') return null;

  // Metro necesita una referencia estática para incluir el módulo en iOS y Android.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications') as NotificationsModule;
}

function isPermissionGranted(
  response: PermissionResponse,
  notifications: NotificationsModule,
) {
  if (response.granted || response.status === 'granted') return true;

  const status = response.ios?.status;
  const allowedStatuses = [
    notifications.IosAuthorizationStatus?.AUTHORIZED,
    notifications.IosAuthorizationStatus?.EPHEMERAL,
    notifications.IosAuthorizationStatus?.PROVISIONAL,
  ].filter((value): value is number => typeof value === 'number');

  return typeof status === 'number' && allowedStatuses.includes(status);
}

function permissionStatus(response: PermissionResponse): ReadingReminderStatus {
  return response.canAskAgain === false ? 'blocked' : 'needs-permission';
}

async function createAndroidChannel(notifications: NotificationsModule) {
  if (Platform.OS !== 'android') return;

  await notifications.setNotificationChannelAsync(CHANNEL_ID, {
    importance: notifications.AndroidImportance.DEFAULT,
    name: 'Momentos de lectura',
    sound: null,
  });
}

async function managedNotifications(notifications: NotificationsModule) {
  const scheduled = await notifications.getAllScheduledNotificationsAsync();
  return scheduled.filter(
    ({ content }) => content?.data?.kind === READING_REMINDER_KIND,
  );
}

async function cancelManagedNotifications(notifications: NotificationsModule) {
  const scheduled = await managedNotifications(notifications);
  await Promise.all(
    scheduled.map(({ identifier }) =>
      notifications.cancelScheduledNotificationAsync(identifier),
    ),
  );
}

async function replaceSchedule(
  notifications: NotificationsModule,
  preference: ReminderPreference,
  rhythm?: ReadingRhythm,
) {
  const schedule = createReadingReminderSchedule(preference, rhythm);
  await cancelManagedNotifications(notifications);

  for (const item of schedule) {
    const trigger =
      item.frequency === 'daily'
        ? {
            channelId: CHANNEL_ID,
            hour: item.hour,
            minute: item.minute,
            type: notifications.SchedulableTriggerInputTypes.DAILY,
          }
        : {
            channelId: CHANNEL_ID,
            hour: item.hour,
            minute: item.minute,
            type: notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: item.weekday,
          };

    await notifications.scheduleNotificationAsync({
      content: {
        ...READING_REMINDER_CONTENT,
        data: { kind: READING_REMINDER_KIND, path: '/' },
        sound: false,
      },
      trigger,
    });
  }

  return schedule.length > 0 ? 'scheduled' : 'inactive';
}

export function configureReadingNotificationHandler() {
  if (handlerConfigured) return;
  const notifications = getNotifications();
  if (!notifications) return;

  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerConfigured = true;
}

export async function activateReadingReminders(
  preference: ReminderPreference,
  rhythm?: ReadingRhythm,
): Promise<ReadingReminderStatus> {
  const notifications = getNotifications();
  if (!notifications) return 'unsupported';
  if (createReadingReminderSchedule(preference, rhythm).length === 0) return 'inactive';

  configureReadingNotificationHandler();
  await createAndroidChannel(notifications);

  let permission = await notifications.getPermissionsAsync();
  if (!isPermissionGranted(permission, notifications)) {
    if (permission.canAskAgain === false) return 'blocked';
    permission = await notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: false },
    });
  }

  if (!isPermissionGranted(permission, notifications)) {
    return permissionStatus(permission);
  }

  return replaceSchedule(notifications, preference, rhythm);
}

export async function reconcileReadingReminders(
  preference: ReminderPreference,
  rhythm?: ReadingRhythm,
): Promise<ReadingReminderStatus> {
  const notifications = getNotifications();
  if (!notifications) return 'unsupported';

  configureReadingNotificationHandler();

  if (!preference.enabled || !rhythm || rhythm === 'later') {
    await cancelManagedNotifications(notifications);
    return 'inactive';
  }

  const permission = await notifications.getPermissionsAsync();
  if (!isPermissionGranted(permission, notifications)) {
    return permissionStatus(permission);
  }

  await createAndroidChannel(notifications);
  return replaceSchedule(notifications, preference, rhythm);
}

export async function disableReadingReminders(): Promise<ReadingReminderStatus> {
  const notifications = getNotifications();
  if (!notifications) return 'unsupported';
  await cancelManagedNotifications(notifications);
  return 'inactive';
}

export async function openReadingNotificationSettings() {
  if (Platform.OS === 'web') return;
  await Linking.openSettings();
}
