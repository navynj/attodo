import { getDashDate } from '@/util/date';
import { atomWithQuery } from 'jotai-tanstack-query';
import { todayAtom } from './ui';

export interface EventType {
  type: 'event';
  id: string;
  date: Date;
  isTime: boolean;
  title: string;
  description?: string;
  isPinned?: boolean;
}

export type TaskTypeType = 'goal' | 'project' | 'recurring';

export const eventsAtom = atomWithQuery<EventType[]>((get) => {
  return {
    queryKey: ['events', get(todayAtom)],
    queryFn: async ({ queryKey: [, today] }) => {
      //     const res = await fetch(
      //       process.env.NEXT_PUBLIC_BASE_URL + `/api/log?date=${getDashDate(today as Date)}`
      //     );
      //     const logs = await res.json();

      //   return convertTaskData(logs);
      return [
        {
          type: 'event',
          id: '1',
          date: new Date(),
          isTime: true,
          title: 'Miral Volunteer',
        },
      ];
    },
  };
});

const convertScheduleData = (schedules: EventType[]) => {
  return schedules;
};
