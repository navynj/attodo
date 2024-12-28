'use client';

import { goalsAtom } from '@/store/goals';
import { tasksAtom } from '@/store/task';
import { useAtomValue } from 'jotai';
import ListItem from '../../_components/ListItem';
import Loader from '@/components/loader/Loader';
import { eventsAtom } from '@/store/event';
import { notesAtom } from '@/store/note';

const Page = () => {
  const { data: tasks, isFetching: isFetchingTasks } = useAtomValue(tasksAtom);
  const { data: goals, isFetching: isFetchingGoals } = useAtomValue(goalsAtom);
  const { data: events, isFetching: isFetchingEvents } = useAtomValue(eventsAtom);
  const { data: notes, isFetching: isFetchingNotes } = useAtomValue(notesAtom);

  return (
    <div className="h-full p-8 space-y-8">
      {/* Header */}
      <h2 className="mt-8 font-extrabold text-3xl mb-6">Inbox</h2>
      <ul className="h-[80%] space-y-6">
        {isFetchingTasks || isFetchingGoals ? (
          <div className="w-full h-full flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <>
            {goals
              ?.filter((goal) => !goal.projectId && !goal.isPinned)
              ?.map((goal) => (
                <ListItem key={goal.id} {...goal} />
              ))}
            {tasks
              ?.filter((task) => !task.date && !task.isPinned)
              ?.map((task) => (
                <ListItem key={task.id} {...task} />
              ))}
            {events
              ?.filter((event) => !event.date && !event.isPinned)
              ?.map((event) => (
                <ListItem key={event.id} {...event} />
              ))}
            {notes
              ?.filter((note) => !note.date && !note.isPinned)
              ?.map((note) => (
                <ListItem key={note.id} {...note} />
              ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default Page;
