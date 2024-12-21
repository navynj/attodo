import { getDashDate } from '@/util/date';
import { atomWithQuery } from 'jotai-tanstack-query';
import { todayAtom } from './ui';

export interface TaskType {
  type: 'task';
  id: string;
  title: string;
  date?: Date;
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
    queryKey: ['tasks', get(todayAtom)],
    queryFn: async ({ queryKey: [, today] }) => {
      //     const res = await fetch(
      //       process.env.NEXT_PUBLIC_BASE_URL + `/api/log?date=${getDashDate(today as Date)}`
      //     );
      //     const logs = await res.json();

      //   return convertTaskData(logs);
      return [
        {
          type: 'task',
          id: '1',
          title: 'Pack Cookies',
          date: new Date(),
          status: 'todo',
        },
        {
          type: 'task',
          id: '2',
          title: 'Wrap the gift',
          date: new Date(),
          status: 'todo',
        },
        {
          type: 'task',
          id: '3',
          title: 'Wash salad for portluck',
          date: new Date(),
          status: 'todo',
        },
        {
          type: 'task',
          id: '4',
          title: "ESL Make a phone call to ICBC for Driver's License Inquiry",
          status: 'done',
          isPinned: true,
        },
        {
          type: 'task',
          id: '5',
          title: 'Wash Crossback',
          status: 'todo',
          isPinned: true,
        },
        {
          type: 'task',
          id: '6',
          title: 'Clean Desk',
          status: 'todo',
          isPinned: true,
        },
      ];
    },
  };
});

const convertTaskData = (tasks: TaskType[]) => {
  return tasks;
};
