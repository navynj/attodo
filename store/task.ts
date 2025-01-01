import { getDashDate } from '@/util/date';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { useQueryClient } from '@tanstack/react-query';
import { todayAtom } from './ui';
import { GoalType } from './goals';
import { ProjectType } from './project';
import { mainFormSchemaType } from '@/app/_components/MainFormOverlay';
import { queryClient } from '@/lib/query';
import { atom } from 'jotai';
import { convertMainFormData } from '@/util/convert';

export interface TaskType {
  type: 'task';
  id: string;
  title: string;
  date?: string;
  status: TaskStatusType;
  description?: string;
  goalId?: string;
  goal?: GoalType;
  projectId?: string;
  project?: ProjectType;
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

export const taskMutation = atomWithMutation<TaskType, Partial<mainFormSchemaType>>(
  () => ({
    mutationKey: ['tasks'],
    mutationFn: async (task) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/task${task.id ? '/' + task.id : ''}`,
          {
            method: task.id ? 'PATCH' : 'POST',
            body: JSON.stringify(convertMainFormData(task)),
          }
        );
        return await res.json();
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tasks'], (prev: TaskType[]) => [
        ...prev.filter((task) => task.id !== data.id),
        data,
      ]);
    },
  })
);

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
