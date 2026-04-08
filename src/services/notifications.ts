/**
 * Local notification scheduling and reminder orchestration.
 */
import { getAuth } from '@react-native-firebase/auth';
import * as Notifications from 'expo-notifications';

import { getReminderMetadata, upsertReminderMetadata } from '@/services/deadlineRepository';

export async function scheduleReminder(_deadlineId: string, _fireDate: Date): Promise<string | null> {
  const triggerDate = _fireDate.getTime();
  if (triggerDate <= Date.now()) return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tax deadline reminder',
      body: 'One of your deadlines is coming up soon.',
      data: { deadlineId: _deadlineId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: _fireDate,
    },
  });

  return notificationId;
}

export async function cancelReminder(_notificationId: string): Promise<void> {
  if (!_notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(_notificationId);
}

function getCurrentUid(): string | null {
  return getAuth().currentUser?.uid ?? null;
}

export async function syncDeadlineReminders(
  deadlineId: string,
  dueDateIso: string,
  reminderDaysBefore: number[],
): Promise<void> {
  const uid = getCurrentUid();
  if (!uid) return;

  const existing = await getReminderMetadata(uid, deadlineId);
  const existingIds = existing?.notificationIds ?? [];

  for (const id of existingIds) {
    await cancelReminder(id);
  }

  const dueDate = new Date(`${dueDateIso}T09:00:00.000Z`);
  const createdIds: string[] = [];

  for (const daysBefore of reminderDaysBefore) {
    const fireDate = new Date(dueDate);
    fireDate.setUTCDate(fireDate.getUTCDate() - daysBefore);
    const notificationId = await scheduleReminder(deadlineId, fireDate);
    if (notificationId) createdIds.push(notificationId);
  }

  await upsertReminderMetadata(uid, {
    deadlineId,
    reminderDaysBefore,
    notificationIds: createdIds,
  });
}
