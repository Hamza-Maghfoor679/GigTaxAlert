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
    const dateKey = d.dueDate.slice(0, 10);
    if (!map[dateKey]) map[dateKey] = { dots: [] };

    const meta = CATEGORY_META[d.category];
    const color = d.isCompleted ? colors.textDisabled : meta.color(colors);
    const alreadyHas = map[dateKey].dots.some((dot) => dot.key === d.category);
    if (!alreadyHas) map[dateKey].dots.push({ key: d.category, color });
  }

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
): Deadline[] =>
  deadlines.filter(
    (d) => d.dueDate.startsWith(monthKey) && (filter === 'all' || d.category === filter),
  );

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
