'use client';

import ListItem from '@/app/_components/ListItem';
import Button from '@/components/button/Button';
import { DraggableItem, DragHandle } from '@/components/draggable/DraggableItem';
import DraggableList from '@/components/draggable/DraggableList';
import Loader from '@/components/loader/Loader';
import Tab from '@/components/tab/Tab';
import { goalsAtom } from '@/store/goals';
import { tasksAtom, TaskType } from '@/store/task';
import { mainFormDataAtom } from '@/store/ui';
import dayjs from 'dayjs';
import { useAtomValue, useSetAtom } from 'jotai';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa6';

const GoalPage = ({ id }: { id: string }) => {
  const router = useRouter();

  const { data: goalList, isFetching: isFetchingGoal } = useAtomValue(goalsAtom);
  const { data: taskList, isFetching: isFetchingTasks } = useAtomValue(tasksAtom);
  const setFormData = useSetAtom(mainFormDataAtom);

  const [filter, setFilter] = useState('todo');

  const goal = useMemo(() => goalList?.find((goal) => goal.id === id), [goalList, id]);

  const tasks = useMemo(
    () => {
      const filteredTasks = taskList?.filter((task) => task.goalId === id)
        .filter((task) => {
          switch (filter) {
            case 'todo':
              return task.status === 'todo';
            case 'inbox':
              return !task.date && task.status === 'todo';
            case 'scheduled':
              return task.date && task.status === 'todo';
            case 'done':
              return task.status !== 'todo';
          }
        })
        filteredTasks?.sort((a, b) => (filter === 'done' ? (dayjs(a.date) > dayjs(b.date) ? -1 : 1) : b.goalRank && a.goalRank?.compareTo(b.goalRank) || 0));
        return filteredTasks;
      }
        ,
    [taskList, id, filter]
  );

  return (
    <div className="h-full p-8">
      <FaChevronLeft
        className="text-2xl mt-2 mb-7"
        onClick={() => {
          router.back();
        }}
      />
      <div className="my-3 pl-2 font-extrabold">
        <h2 className="text-3xl inline mr-4">{goal?.title}</h2>
        {goal?.dueDate && <span>~{dayjs(goal.dueDate).format('MMM D')}</span>}
        {goal && (
          <Button
            className="block mt-2 px-4 py-1 text-sm rounded-md shrink-0"
            onClick={() => {
              setFormData(goal);
              router.push(`?main-input=show`);
            }}
          >
            Edit Goal
          </Button>
        )}
      </div>
      {goal && (
        <Tab
          id="matrix-status-filter"
          className="text-sm tracking-tighter my-6"
          value={filter}
          setValue={setFilter}
          tabs={[
            {
              label: 'Todo',
              value: 'todo',
            },
            {
              label: 'Inbox',
              value: 'inbox',
            },
            {
              label: 'Scheduled',
              value: 'scheduled',
            },
            {
              label: 'Done',
              value: 'done',
            },
          ]}
        />
      )}
      {isFetchingTasks ? (
        <Loader />
      ) : (
        <DraggableList<TaskType>
          items={tasks || []}
          rankKey="goalRank"
          renderItem={(item) => <DraggableItem id={item.id} className="flex items-center gap-2">
            <DragHandle />
            <ListItem {...item} />
          </DraggableItem>}
          className={`${
            isFetchingTasks
              ? 'h-[80%]'
              : ''
          } space-y-6`}
        />
      )}
    </div>
  );
};

export default GoalPage;
