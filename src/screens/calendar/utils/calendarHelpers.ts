import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

import { CATEGORY_META } from '@/constants/deadlineCategories';
import type { Colors } from '@/theme';
import { Deadline } from '@/components/ui/homeComponents/deadline.types';
import { FilterCategory, MarkedDates } from '../types';

export const buildMarkedDates = (
  deadlines: Deadline[],
  colors: Colors,
  filter: FilterCategory,
  selectedDate?: string,
): MarkedDates => {
  const filtered = filter === 'all' ? deadlines : deadlines.filter((d) => d.category === filter);
  const map: MarkedDates = {};

  for (const d of filtered) {
    const dateKey = String(d.dueDate).slice(0, 10);
    if (!map[dateKey]) map[dateKey] = { dots: [] };

    const category = d.category ?? 'other';
    const meta = CATEGORY_META[category] ?? CATEGORY_META.other;
    const color = d.completed ? colors.textDisabled : meta.color(colors);
    const alreadyHas = map[dateKey].dots.some((dot) => dot.key === category);
    if (!alreadyHas) map[dateKey].dots.push({ key: category, color });
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  if (!map[todayKey]) map[todayKey] = { dots: [] };
  map[todayKey].todayTextColor = colors.primary;

  if (selectedDate) {
    if (!map[selectedDate]) map[selectedDate] = { dots: [] };
    map[selectedDate].selected = true;
    map[selectedDate].selectedColor = colors.primary;
  }

  return map;
};

export const deadlinesForMonth = (
  deadlines: Deadline[],
  monthKey: string,
  filter: FilterCategory,
): Deadline[] => {
  const filtered = deadlines.filter((deadline) => {
    const inMonth = String(deadline.dueDate).startsWith(monthKey);
    const inFilter = filter === 'all' || deadline.category === filter;
    return inMonth && inFilter;
  });

  return filtered.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.daysLeft < 0 && b.daysLeft >= 0) return -1;
    if (a.daysLeft >= 0 && b.daysLeft < 0) return 1;
    return new Date(String(a.dueDate)).getTime() - new Date(String(b.dueDate)).getTime();
  });
};

export const addToDeviceCalendar = async (deadline: Deadline): Promise<void> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission required',
      'Please allow calendar access in your device settings to add deadlines.',
    );
    return;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar =
    calendars.find((c) =>
      Platform.OS === 'ios' ? c.source.name === 'Default' || c.allowsModifications : c.isPrimary,
    ) ?? calendars[0];

  if (!defaultCalendar) {
    Alert.alert('No calendar found', 'Could not find a writable calendar on your device.');
    return;
  }

  const startDate = new Date(deadline.dueDate);
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 1);

  await Calendar.createEventAsync(defaultCalendar.id, {
    title: deadline.title,
    notes: `${deadline.description}\n\n${deadline.penaltyInfo}`,
    startDate,
    endDate,
    alarms: [{ relativeOffset: -60 * 24 * 7 }, { relativeOffset: -60 * 24 }],
    url: deadline.paymentUrl || undefined,
  });

  Alert.alert('Added to Calendar', `"${deadline.title}" has been added with reminders.`);
};
