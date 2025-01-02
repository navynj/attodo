import { getDashDate } from '@/util/date';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { todayAtom } from './ui';
import { mainFormSchemaType } from '@/app/_overlay/MainFormOverlay';
import { convertMainFormData } from '@/util/convert';
import { queryClient } from '@/lib/query';

export interface EventType {
  type: 'event';
  id: string;
  date: string;
  isTime: boolean;
  title: string;
  description?: string;
  isPinned?: boolean;
}

export const eventsAtom = atomWithQuery<EventType[]>((get) => {
  return {
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/event');
      return await res.json();
    },
  };
});

export const eventMutation = atomWithMutation<EventType, Partial<mainFormSchemaType>>(
  () => ({
    mutationKey: ['events'],
    mutationFn: async (event) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/event${
            event.id ? '/' + event.id : ''
          }`,
          {
            method: event.id ? 'PATCH' : 'POST',
            body: JSON.stringify(convertMainFormData(event)),
          }
        );
        return await res.json();
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['events'], (prev: EventType[]) => [
        ...prev.filter((event) => event.id !== data.id),
        data,
      ]);
    },
  })
);
