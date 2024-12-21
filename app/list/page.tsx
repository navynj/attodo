'use client';

import { eventsAtom } from '@/store/event';
import { notesAtom } from '@/store/note';
import { tasksAtom } from '@/store/task';
import { getDashDate, getDateStr } from '@/util/date';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import ListItem from '../_components/ListItem';

const Page = () => {
  const { data: tasks } = useAtomValue(tasksAtom);
  const { data: events } = useAtomValue(eventsAtom);
  const { data: notes } = useAtomValue(notesAtom);

  const pushDate = (date: Date) => {
    const dashedDate = getDashDate(date);
    if (dayjs(dashedDate) >= dayjs(getDashDate(new Date()))) {
      dateList.push(getDashDate(date));
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
    <div className="p-8 space-y-6">
      {[...dateSet].map((date) => (
        <ul key={date}>
          <h5 className="font-extrabold mb-4">{getDateStr(new Date(date))}</h5>
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
      ))}
    </div>
  );
};

export default Page;
