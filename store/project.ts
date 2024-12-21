import { getDashDate } from '@/util/date';
import { atomWithQuery } from 'jotai-tanstack-query';
import { todayAtom } from './ui';
import { TaskType } from './task';
import { GoalType } from './goals';

export interface ProjectType {
  id: string;
  icon: string;
  title: string;
  status?: ProjectStatusType;
  startDate?: Date;
  dueDate?: Date;
  description?: string;
  isImportant?: boolean;
  isUrgent?: boolean;
  size?: number;
  weight?: number;
  tasks: TaskType[];
  goals: GoalType[];
}

export type ProjectStatusType = 'done' | 'dismissed';

export const projectAtom = atomWithQuery<ProjectType[]>((get) => {
  return {
    queryKey: ['project', get(todayAtom)],
    queryFn: async ({ queryKey: [, today] }) => {
      //     const res = await fetch(
      //       process.env.NEXT_PUBLIC_BASE_URL + `/api/log?date=${getDashDate(today as Date)}`
      //     );
      //     const logs = await res.json();

      //   return convertTaskData(logs);
      return [
        {
          id: 'rock',
          icon: '🥁',
          title: 'Rock Band',
          tasks: [],
          goals: [],
        },
        {
          id: 'jazz',
          icon: '🎷',
          title: 'Jazz Band',
          tasks: [],
          goals: [],
        },
        {
          id: 'blog',
          icon: '⌨️',
          title: 'Blog Posting',
          tasks: [],
          goals: [],
        },
      ];
    },
  };
});

const convertScheduleData = (schedules: ProjectType[]) => {
  return schedules;
};
