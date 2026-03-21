import { create } from 'zustand';

export type DeadlineItem = {
  daysLeft: number;
  id: string;
  title: string;
  dueDate: string;
  category: string;
  isComplete: boolean;
};

type DeadlineState = {
  deadlines: DeadlineItem[];
  setDeadlines: (items: DeadlineItem[]) => void;
  toggleComplete: (id: string) => void;
};

export const useDeadlineStore = create<DeadlineState>((set) => ({
  deadlines: [],
  setDeadlines: (deadlines) => set({ deadlines }),
  toggleComplete: (id) =>
    set((state) => ({
      deadlines: state.deadlines.map((d) =>
        d.id === id ? { ...d, isComplete: !d.isComplete } : d,
      ),
    })),
}));
