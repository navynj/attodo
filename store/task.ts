import { getDashDate } from '@/util/date';
import { atomWithQuery } from 'jotai-tanstack-query';
import { todayAtom } from './ui';

export interface TaskType {
  type: 'task';
  id: string;
  title: string;
  date?: string;
  status: TaskStatusType;
  description?: string;
  goalId?: string;
  projectId?: string;
  isPinned?: boolean;
  isImportant?: boolean;
  isUrgent?: boolean;
  size?: number;
  weight?: number;
}

export type TaskStatusType = 'todo' | 'done' | 'delayed' | 'dismissed';

export const tasksAtom = atomWithQuery<TaskType[]>((get) => {
  return {
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/task');
      return await res.json();
    },
  };
});

export const todayTasksAtom = atomWithQuery<TaskType[]>((get) => {
  return {
    queryKey: ['todayTasks', get(todayAtom)],
    queryFn: async ({ queryKey: [, today] }) => {
      const res = await fetch(
        process.env.NEXT_PUBLIC_BASE_URL + `/api/task?date=${getDashDate(today as Date)}`
      );
      return await res.json();
    },
  };
});
