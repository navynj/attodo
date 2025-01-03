import { mainFormSchemaType } from '@/app/_overlay/MainFormOverlay';
import { convertMainFormData, convertRank, updateData } from '@/util/convert';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { LexoRank } from 'lexorank';

export interface EventType {
  type: 'event';
  id: string;
  date: string;
  isTime: boolean;
  title: string;
  description?: string;
  isPinned?: boolean;
  listRank?: LexoRank;
}

export const eventsAtom = atomWithQuery<EventType[]>((get) => {
  return {
    queryKey: ['event'],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/event');
      const data = await res.json();
      return data.map((item: any) => convertRank(item));
    },
  };
});

export const eventMutation = atomWithMutation<EventType, Partial<mainFormSchemaType> & {createdAt?: string, updatedAt?: string}>(
  () => ({
    mutationKey: ['event'],
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
      updateData(data, 'event');
    }
  })
);