import { getDashDate } from '@/util/date';
import { atomWithQuery } from 'jotai-tanstack-query';
import { todayAtom } from './ui';
import { TaskType } from './task';

export interface GoalType {
  type: 'goal';
  id: string;
  title: string;
  status: GoalStatusType;
  dueDate?: string;
  description?: string;
  projectId?: string;
  isPinned?: boolean;
  isImportant?: boolean;
  isUrgent?: boolean;
  size?: number;
  weight?: number;
  tasks: TaskType[];
}

export type GoalStatusType = 'todo' | 'inprogress' | 'done' | 'dismissed';

export const goalsAtom = atomWithQuery<GoalType[]>((get) => {
  return {
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/goal');
      return await res.json();
    },
  };
});

const convertTaskData = (tasks: TaskType[]) => {
  return tasks;
};
