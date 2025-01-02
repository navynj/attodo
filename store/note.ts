import { mainFormSchemaType } from '@/app/_overlay/MainFormOverlay';
import { queryClient } from '@/lib/query';
import { convertMainFormData } from '@/util/convert';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';

export interface NoteType {
  type: 'note';
  id: string;
  date: string;
  title: string;
  description?: string;
  isPinned?: boolean;
}

export type TaskTypeType = 'goal' | 'project' | 'recurring';

export const notesAtom = atomWithQuery<NoteType[]>((get) => {
  return {
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/note');
      return await res.json();
    },
  };
});

export const noteMutation = atomWithMutation<NoteType, Partial<mainFormSchemaType>>(
  () => ({
    mutationKey: ['notes'],
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
      queryClient.setQueryData(['notes'], (prev: NoteType[]) => [
        ...prev.filter((note) => note.id !== data.id),
        data,
      ]);
    },
  })
);
