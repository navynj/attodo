import { mainFormSchemaType } from '@/app/_overlay/MainFormOverlay';
import { convertMainFormData, convertRank, updateData } from '@/util/convert';
import { getDashDate } from '@/util/date';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { LexoRank } from 'lexorank';
import { GoalType } from './goals';
import { ProjectType } from './project';
import { todayAtom } from './ui';

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
  size?: number | null;
  weight?: number | null;
  showOutside?: boolean;
  listRank?: LexoRank;
  matrixRank?: LexoRank;
  goalRank?: LexoRank;
}

export type TaskStatusType = 'todo' | 'done' | 'delayed' | 'dismissed';

export const tasksAtom = atomWithQuery<TaskType[]>((get) => {
  return {
    queryKey: ['task'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/task');
      const data = await res.json();
      return data.map((item: any) => convertRank(item));
    },
  };
});

export const taskMutation = atomWithMutation<TaskType, Partial<mainFormSchemaType> & {createdAt?: string, updatedAt?: string}>(
  () => ({
    mutationKey: ['task'],
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
      updateData(data, 'task');
    }
  }
));

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
