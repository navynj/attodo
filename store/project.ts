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
  startDate?: string;
  dueDate?: string;
  description?: string;
  isImportant?: boolean;
  isUrgent?: boolean;
  size?: number;
  weight?: number;
  tasks: TaskType[];
  goals: GoalType[];
}

export type ProjectStatusType = 'todo' | 'done' | 'dismissed';

export const projectAtom = atomWithQuery<ProjectType[]>((get) => {
  return {
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/project');
      return await res.json();
    },
  };
});

const convertScheduleData = (schedules: ProjectType[]) => {
  return schedules;
};
