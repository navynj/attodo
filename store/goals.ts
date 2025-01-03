import { mainFormSchemaType } from '@/app/_overlay/MainFormOverlay';
import { convertMainFormData, convertRank, updateData } from '@/util/convert';
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
    queryKey: ['goal'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/goal');
      const data = await res.json();
      return data.map((item: any) => convertRank(item));
    },
  };
});

export const goalMutation = atomWithMutation<GoalType, Partial<mainFormSchemaType> & {createdAt?: string, updatedAt?: string}>(
  () => ({
    mutationKey: ['goal'],
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
      updateData(data, 'goal');
    }
  })
);

