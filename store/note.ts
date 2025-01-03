import { mainFormSchemaType } from '@/app/_overlay/MainFormOverlay';
import { convertMainFormData, convertRank, updateData } from '@/util/convert';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { LexoRank } from 'lexorank';

export interface NoteType {
  type: 'note';
  id: string;
  date: string;
  title: string;
  description?: string;
  isPinned?: boolean;
  listRank?: LexoRank;
}

export type TaskTypeType = 'goal' | 'project' | 'recurring';

export const notesAtom = atomWithQuery<NoteType[]>((get) => {
  return {
    queryKey: ['note'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/note');
      const data = await res.json();
      return data.map((item: any) => convertRank(item));
    },
  };
});

export const noteMutation = atomWithMutation<NoteType, Partial<mainFormSchemaType>& {createdAt?: string, updatedAt?: string}>(
  () => ({
    mutationKey: ['note'],
    mutationFn: async (note) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/note${note.id ? '/' + note.id : ''}`,
          {
            method: note.id ? 'PATCH' : 'POST',
            body: JSON.stringify(convertMainFormData(note)),
          }
        );
        return await res.json();
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: (data) => {
      updateData(data, 'note'); 
    }
  })
);
