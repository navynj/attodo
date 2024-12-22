import { getDashDate } from '@/util/date';
import { atomWithQuery } from 'jotai-tanstack-query';
import { todayAtom } from './ui';

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

const convertScheduleData = (schedules: NoteType[]) => {
  return schedules;
};
