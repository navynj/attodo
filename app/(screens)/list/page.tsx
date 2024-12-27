'use client';

import { eventsAtom } from '@/store/event';
import { notesAtom } from '@/store/note';
import { tasksAtom } from '@/store/task';
import { getDashDate, getDateStr } from '@/util/date';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import ListItem from '../../_components/ListItem';
import Loader from '@/components/loader/Loader';

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
  });
  const dateSet = new Set(dateList);

  return (
    <div className="h-full p-8 space-y-12">
      {isFetchingTasks || isFetchingEvents || isFetchingNotes ? (
        <div className="w-full h-full flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        [...dateSet].map((date) => (
          <ul key={date}>
            <h5 className="font-extrabold mb-4">{getDateStr(date)}</h5>
            <ul className="space-y-6">
              {events
                ?.filter((event) => getDashDate(event.date) === date)
                .map((event) => (
                  <ListItem key={event.id} {...event} />
                ))}
              {tasks
                ?.filter((task) => {
                  if (task.date && getDashDate(task.date) === date) return true;
                })
                .map((task) => (
                  <ListItem key={task.id} {...task} />
                ))}
              {notes
                ?.filter((note) => getDashDate(note.date) === date)
                .map((note) => (
                  <ListItem key={note.id} {...note} />
                ))}
            </ul>
          </ul>
        ))
      )}
    </div>
  );
};

export default Page;
