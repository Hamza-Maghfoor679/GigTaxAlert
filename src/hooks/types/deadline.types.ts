import type { DeadlineCategory } from '@/components/ui/homeComponents/deadline.types';

export type DeadlineErrorType = 'NETWORK_ERROR' | 'PERMISSION_DENIED' | 'UNKNOWN';

export type DeadlineError = {
  type: DeadlineErrorType;
  message: string;
};

export type HookDeadline = {
  id: string;
  title: string;
  dueDate: Date;
  isComplete: boolean;
  daysLeft: number;
  category: DeadlineCategory;
  type: string;
  description: string;
  penaltyInfo?: string;
  paymentUrl?: string;
  completed?: boolean;
};

export type UseDeadlinesResult = {
  deadlines: HookDeadline[];
  activeDeadlines: HookDeadline[];
  completedDeadlines: HookDeadline[];
  upcomingDeadlines: HookDeadline[];
  loading: boolean;
  error: DeadlineError | null;
  refetch: () => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
};
