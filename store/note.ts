import { getDashDate } from '@/util/date';
import { atomWithQuery } from 'jotai-tanstack-query';
import { todayAtom } from './ui';

export interface NoteType {
  type: 'note';
  id: string;
  date: Date;
  title: string;
  description?: string;
  isPinned?: boolean;
}

export type TaskTypeType = 'goal' | 'project' | 'recurring';

export const notesAtom = atomWithQuery<NoteType[]>((get) => {
  return {
    queryKey: ['notes', get(todayAtom)],
    queryFn: async ({ queryKey: [, today] }) => {
      //     const res = await fetch(
      //       process.env.NEXT_PUBLIC_BASE_URL + `/api/log?date=${getDashDate(today as Date)}`
      //     );
      //     const logs = await res.json();

      //   return convertTaskData(logs);
      return [
        {
          type: 'note',
          id: '1',
          date: new Date(),
          title: '10:30 Go out',
        },
      ];
    },
  };
});

const convertScheduleData = (schedules: NoteType[]) => {
  return schedules;
};
