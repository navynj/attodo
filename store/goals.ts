import { getDashDate } from '@/util/date';
import { atomWithQuery } from 'jotai-tanstack-query';
import { todayAtom } from './ui';
import { TaskType } from './task';

export interface GoalType {
  type: 'goal';
  id: string;
  title: string;
  status: GoalStatusType;
  dueDate?: Date;
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
    queryKey: ['goals', get(todayAtom)],
    queryFn: async ({ queryKey: [, today] }) => {
      //     const res = await fetch(
      //       process.env.NEXT_PUBLIC_BASE_URL + `/api/log?date=${getDashDate(today as Date)}`
      //     );
      //     const logs = await res.json();

      //   return convertTaskData(logs);
      return [
        {
          type: 'goal',
          id: '1',
          title: 'Resume',
          status: 'todo',
          isPinned: true,
          tasks: [],
        },
        {
          type: 'goal',
          id: '2',
          title: 'Fly Me To The Moon',
          dueDate: new Date(2024, 12, 28),
          status: 'todo',
          projectId: 'jazz',
          isPinned: true,
          tasks: [],
        },
        {
          type: 'goal',
          id: '3',
          title: 'Mission 1',
          dueDate: new Date(),
          status: 'todo',
          projectId: 'React Study',
          isPinned: true,
          tasks: [],
        },
        {
          type: 'goal',
          id: '4',
          title: 'Reply Penpal',
          status: 'todo',
          tasks: [],
        },
        {
          type: 'goal',
          id: '5',
          title: 'Smore Dip Zipup Knitting',
          status: 'todo',
          tasks: [],
        },
        {
          type: 'goal',
          id: '6',
          title: 'The Giver',
          status: 'todo',
          tasks: [],
        },
        {
          type: 'goal',
          id: '7',
          title: "Can't Stop",
          status: 'todo',
          projectId: 'rock',
          tasks: [],
        },
        {
          type: 'goal',
          id: '8',
          title: "Sweet Child O' Mine",
          status: 'todo',
          projectId: 'rock',
          tasks: [],
        },
        {
          type: 'goal',
          id: '9',
          title: 'Holiday',
          status: 'todo',
          projectId: 'rock',
          tasks: [],
        },
        {
          type: 'goal',
          id: '10',
          title: 'November Blog Posting',
          status: 'todo',
          projectId: 'blog',
          tasks: [],
        },
        {
          type: 'goal',
          id: '11',
          title: 'December Blog Posting',
          status: 'todo',
          projectId: 'blog',
          tasks: [],
        },
      ];
    },
  };
});

const convertTaskData = (tasks: TaskType[]) => {
  return tasks;
};
