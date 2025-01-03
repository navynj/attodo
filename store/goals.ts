import { mainFormSchemaType } from '@/app/_overlay/MainFormOverlay';
import { queryClient } from '@/lib/query';
import { convertMainFormData, convertRank } from '@/util/convert';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { LexoRank } from "lexorank";
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
  size?: number | null;
  weight?: number | null;
  tasks: TaskType[];
  matrixRank?: LexoRank;
}

export type GoalStatusType = 'todo' | 'inprogress' | 'done' | 'dismissed';

export const goalsAtom = atomWithQuery<GoalType[]>((get) => {
  return {
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/goal');
      const data = await res.json();
      return data.map((item: any) => convertRank(item));
    },
  };
});

export const goalMutation = atomWithMutation<GoalType, Partial<mainFormSchemaType> & {createdAt?: string, updatedAt?: string}>(
  () => ({
    mutationKey: ['goals'],
    mutationFn: async (goal) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/goal${goal.id ? '/' + goal.id : ''}`,
          {
            method: goal.id ? 'PATCH' : 'POST',
            body: JSON.stringify(convertMainFormData(goal)),
          }
        );
        return await res.json();
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['goals'], (prev: GoalType[]) => [
        ...prev.filter((goal) => goal.id !== data.id),
        convertRank(data),
      ]);
    },
  })
);
