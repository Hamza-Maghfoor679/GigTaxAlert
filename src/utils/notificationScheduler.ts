/**
 * Local deadline reminders. iOS allows at most 64 pending local notifications;
 * with up to 6 per deadline we stay within that cap for typical deadline counts.
 */
import * as Notifications from 'expo-notifications';
import { addDays, format, startOfDay, subDays } from 'date-fns';
import { Platform } from 'react-native';

import type { HookDeadline } from '@/hooks/types/deadline.types';
import type { NotificationPreferences } from '@/screens/settings/types/settings.types';

type ReminderDataType = 'deadline_reminder' | 'day_of' | 'post_deadline' | 'next_deadline';

function formatDeadlineDate(date: Date): string {
  return format(date, 'MMMM d');
}

function setTime(date: Date, hours: number, minutes = 0): Date {
  const d = new Date(date.getTime());
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function findNextDeadlineAfter(
  current: HookDeadline,
  all: HookDeadline[],
  todayStart: Date,
): HookDeadline | null {
  const currentTs = current.dueDate.getTime();
  let best: HookDeadline | null = null;
  let bestTs = Number.POSITIVE_INFINITY;

  for (const d of all) {
    if (d.isComplete) continue;
    const dueStart = startOfDay(d.dueDate);
    if (dueStart < todayStart) continue;
    if (d.dueDate.getTime() <= currentTs) continue;
    const t = d.dueDate.getTime();
    if (t < bestTs) {
      bestTs = t;
      best = d;
    }
  }

  return best;
}

async function scheduleOne(
  content: {
    title: string;
    body: string;
    data: { deadlineId: string; type: ReminderDataType };
  },
  triggerDate: Date,
): Promise<boolean> {
  if (triggerDate <= new Date()) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      data: content.data,
      ...(Platform.OS === 'android' ? { channelId: 'deadlines' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
  return true;
}

export async function scheduleAllNotifications(
  deadlines: HookDeadline[],
  prefs?: NotificationPreferences,
): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[notificationScheduler] cleared existing notifications');
    if (prefs && prefs.globalEnabled === false) {
      return;
    }

    const todayStart = startOfDay(new Date());
    let count = 0;

    for (const deadline of deadlines) {
      if (deadline.isComplete) continue;

      const dueStart = startOfDay(deadline.dueDate);
      if (dueStart < todayStart) continue;

      const due = new Date(deadline.dueDate.getTime());
      const formattedDue = formatDeadlineDate(due);

      const candidates: Array<{
        triggerDate: Date;
        title: string;
        body: string;
        type: ReminderDataType;
      }> = [
        {
          triggerDate: setTime(subDays(due, 30), 9, 0),
          title: `${deadline.title} in 30 days`,
          body: `${formattedDue} is coming up. A good time to set money aside.`,
          type: 'deadline_reminder',
        },
        {
          triggerDate: setTime(subDays(due, 7), 9, 0),
          title: `${deadline.title} next week`,
          body: '7 days left. Log into GigTax to check what you owe.',
          type: 'deadline_reminder',
        },
        {
          triggerDate: setTime(subDays(due, 1), 9, 0),
          title: `${deadline.title} is TOMORROW`,
          body: "Don't get penalized. Open GigTax to review your estimate.",
          type: 'deadline_reminder',
        },
        {
          triggerDate: setTime(due, 9, 0),
          title: `Tax deadline today — ${deadline.title}`,
          body: 'Pay before midnight to avoid penalties.',
          type: 'day_of',
        },
        {
          triggerDate: setTime(addDays(due, 2), 10, 0),
          title: `Did you file? — ${deadline.title}`,
          body: 'Mark it done in GigTax to keep your calendar clean.',
          type: 'post_deadline',
        },
      ];

      const nextDeadline = findNextDeadlineAfter(deadline, deadlines, todayStart);
      if (nextDeadline) {
        const formattedNext = formatDeadlineDate(nextDeadline.dueDate);
        candidates.push({
          triggerDate: setTime(addDays(due, 1), 10, 0),
          title: `${deadline.title} done — next up`,
          body: `${nextDeadline.title} is due on ${formattedNext}.`,
          type: 'next_deadline',
        });
      }

      for (const c of candidates) {
        if (prefs) {
          if (c.type === 'deadline_reminder' && !prefs.deadlines) continue;
          if (c.type === 'day_of' && !prefs.dayOf) continue;
          if ((c.type === 'post_deadline' || c.type === 'next_deadline') && !prefs.postDeadline) {
            continue;
          }
        }
        const scheduled = await scheduleOne(
          {
            title: c.title,
            body: c.body,
            data: { deadlineId: deadline.id, type: c.type },
          },
          c.triggerDate,
        );
        if (scheduled) count += 1;
      }
    }

    console.log(`[notificationScheduler] scheduled ${count} notifications`);
  } catch (error) {
    console.error('[notificationScheduler] scheduling failed:', error);
  }
}
