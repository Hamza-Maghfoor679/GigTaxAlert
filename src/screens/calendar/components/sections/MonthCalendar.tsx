import { StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { radius, s, useThemeColors } from '@/theme';
import { MarkedDates } from '../../types';

type Props = {
  markedDates: MarkedDates;
  selectedDate: string;
  onDayPress: (dateString: string) => void;
  onMonthChange: (monthKey: string) => void;
};

export function MonthCalendar({ markedDates, onDayPress, onMonthChange }: Props) {
  const colors = useThemeColors();
  const theme = {
    calendarBackground: colors.surface,
    backgroundColor: colors.surface,
    monthTextColor: colors.textPrimary,
    textMonthFontFamily: 'Inter_700Bold',
    textMonthFontSize: s(17),
    arrowColor: colors.primary,
    textSectionTitleColor: colors.textSecondary,
    textDayHeaderFontFamily: 'Inter_600SemiBold',
    textDayHeaderFontSize: s(12),
    dayTextColor: colors.textPrimary,
    textDayFontFamily: 'Inter_400Regular',
    textDayFontSize: s(14),
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: colors.primary,
    todayBackgroundColor: colors.primaryLight,
    textDisabledColor: colors.textDisabled,
    dotColor: colors.primary,
    selectedDotColor: '#FFFFFF',
  };

  const styles = StyleSheet.create({
    calendar: {
      borderRadius: radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  return (
    <Calendar
      style={styles.calendar}
      theme={theme}
      markingType="multi-dot"
      markedDates={markedDates}
      onDayPress={(day) => onDayPress(day.dateString)}
      onMonthChange={(month) => onMonthChange(`${month.year}-${String(month.month).padStart(2, '0')}`)}
      enableSwipeMonths
      hideExtraDays
    />
  );
}
