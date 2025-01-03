'use client';

import { eventsAtom } from '@/store/event';
import { notesAtom } from '@/store/note';
import { tasksAtom } from '@/store/task';
import { getDashDate, getDateStr } from '@/util/date';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import ListItem from '../../_components/ListItem';
import Loader from '@/components/loader/Loader';
import DraggableList from '@/components/draggable/DraggableList';
import { DraggableItem, DragHandle } from '@/components/draggable/DraggableItem';

const Page = () => {
  const { data: tasks, isFetching: isFetchingTasks } = useAtomValue(tasksAtom);
  const { data: events, isFetching: isFetchingEvents } = useAtomValue(eventsAtom);
  const { data: notes, isFetching: isFetchingNotes } = useAtomValue(notesAtom);

  const pushDate = (date: string) => {
    const dashedDate = getDashDate(date);
    if (dayjs(dashedDate) >= dayjs(getDashDate(new Date()))) {
      dashedDate && dateList.push(dashedDate);
    }
  };

  const dateList: string[] = [];
  tasks?.forEach((task) => task.date && pushDate(task.date));
  events?.forEach((event) => {
    pushDate(event.date);
  });
  notes?.map((note) => {
    pushDate(note.date);
  })
  const dateSet = new Set(dateList);

  return (
    <div className="h-full p-8 space-y-12">
      {isFetchingTasks || isFetchingEvents || isFetchingNotes ? (
        <div className="w-full h-full flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        [...dateSet].sort().map((date) => 
          <ul key={date}>
            <h5 className="font-extrabold mb-4">{getDateStr(date)}</h5>
            <DraggableList
            items={[...(events || []).filter((event) => getDashDate(event.date) === date), ...(tasks || []).filter((task) => {
              if (
                task.status === 'todo' &&
                task.date &&
                getDashDate(task.date) === date
              )
                return true;
            }), ...(notes || []).filter((note) => getDashDate(note.date) === date)].sort((a, b) => b.listRank && a.listRank?.compareTo(b.listRank) || 0 )}   
            rankKey="listRank"
          renderItem={(item) => <DraggableItem id={item.id} className="flex items-center gap-2">
            <DragHandle />
            <ListItem {...item} />
          </DraggableItem>}
          className={`${
            isFetchingTasks || isFetchingEvents || isFetchingNotes
              ? 'h-[80%]'
              : ''
          } space-y-6`}
            />
          </ul>
      ))}
    </div>
  );
};

export default Page;
