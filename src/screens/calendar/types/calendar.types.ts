import { DeadlineCategory } from '@/components/ui/homeComponents/deadline.types';

export type FilterCategory = 'all' | DeadlineCategory;

export type MarkedDates = Record<
  string,
  {
    dots: { key: string; color: string }[];
    selected?: boolean;
    selectedColor?: string;
    todayTextColor?: string;
  }
>;
