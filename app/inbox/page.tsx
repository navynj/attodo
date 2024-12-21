'use client';

import Button from '@/components/button/Button';
import List from '@/app/_components/List';
import { goalsAtom } from '@/store/goals';
import { tasksAtom } from '@/store/task';
import { getDashDate } from '@/util/date';
import { useAtomValue } from 'jotai';
import { FaSquare } from 'react-icons/fa6';
import ListItem from '../_components/ListItem';

const page = () => {
  const { data: goals } = useAtomValue(goalsAtom);
  const { data: tasks } = useAtomValue(tasksAtom);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <h2 className="mt-8 font-extrabold text-3xl mb-6">Inbox</h2>
      <ul className="space-y-6">
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
      </ul>
    </div>
  );
};

export default page;
