'use client';

import { goalsAtom } from '@/store/goals';
import { tasksAtom } from '@/store/task';
import { useAtomValue } from 'jotai';
import ListItem from '../../_components/ListItem';
import Loader from '@/components/loader/Loader';

const Page = () => {
  const { data: tasks, isFetching: isFetchingTasks } = useAtomValue(tasksAtom);
  const { data: goals, isFetching: isFetchingGoals } = useAtomValue(goalsAtom);

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
          </>
        )}
      </ul>
    </div>
  );
};

export default Page;
