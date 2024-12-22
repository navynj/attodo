import { getDashDate } from '@/util/date';
import { atomWithQuery } from 'jotai-tanstack-query';
import { todayAtom } from './ui';

export interface EventType {
  type: 'event';
  id: string;
  date: string;
  isTime: boolean;
  title: string;
  description?: string;
  isPinned?: boolean;
}

export type TaskTypeType = 'goal' | 'project' | 'recurring';

export const eventsAtom = atomWithQuery<EventType[]>((get) => {
  return {
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/event');
      return await res.json();
    },
  };
});

const convertScheduleData = (schedules: EventType[]) => {
  return schedules;
};
