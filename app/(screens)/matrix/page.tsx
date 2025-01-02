'use client';

import { eventsAtom } from '@/store/event';
import { notesAtom } from '@/store/note';
import { tasksAtom } from '@/store/task';
import { getDashDate, getDateStr } from '@/util/date';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import MatrixItem from '../../_components/MatrixItem';
import Loader from '@/components/loader/Loader';
import { goalsAtom } from '@/store/goals';
import { useMemo, useState } from 'react';
import Tab from '@/components/tab/Tab';

const Page = () => {
  const { data: goalData, isFetching: isFetchingGoals } = useAtomValue(goalsAtom);
  const { data: taskData, isFetching: isFetchingTasks } = useAtomValue(tasksAtom);

  const [isGoal, setIsGoal] = useState(true);
  const [statusFilter, setStatusFilter] = useState('todo');
  const [dateFilter, setDateFilter] = useState('all');

  const goals = useMemo(() => goalData?.filter((goal) => {
    switch(statusFilter) {
      case 'todo':
        return goal.status === 'todo';
      case 'done':
        return goal.status === 'done';
    }
  }), [goalData, statusFilter]);


  const tasks = useMemo(() => taskData?.filter((task) => {
    switch(statusFilter) {
      case 'todo':
        return task.status === 'todo';
      case 'inbox':
        return !task.date;
      case 'scheduled':
        return task.date;
      case 'done':
        return task.status === 'done';
    }
  }).filter((task) => {
    switch (dateFilter) {
      case 'today':
        return getDashDate(task.date) === getDashDate(new Date());
      case 'week':
        return dayjs(getDashDate(task.date)) <= dayjs().endOf('week');
      case 'upcoming':
        return dayjs(getDashDate(task.date)) > dayjs().endOf('week');
      case 'all':
        return true;
    }
  }), [taskData, statusFilter, dateFilter]);

  return (
    <div className="h-full p-6">
      {isFetchingTasks || isFetchingGoals ? (
        <div className="w-full h-full flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-4 text-2xl font-extrabold my-4 tracking-tighter">
            <button
              onClick={() => setIsGoal(true)}
              className={isGoal ? '' : 'text-gray-300'}
            >
              Goals
            </button>
            <button
              onClick={() => setIsGoal(false)}
              className={isGoal ? 'text-gray-300' : ''}
            >
              Tasks
            </button>
          </div>
          <div>
            <Tab
              id="matrix-status-filter"
              className="text-sm tracking-tighter"
              value={statusFilter}
              setValue={setStatusFilter}
              tabs={[
                {
                  label: 'Todo',
                  value: 'todo',
                },
                !isGoal && {
                  label: 'Inbox',
                  value: 'inbox',
                },
                !isGoal && {
                  label: 'Scheduled',
                  value: 'scheduled',
                },
                {
                  label: 'Done',
                  value: 'done',
                },
              ]}
            />
            {!isGoal && (
              <Tab
                id="matrix-date-filter"
                className="text-sm tracking-tighter"
                value={dateFilter}
                setValue={setDateFilter}
                tabs={[
                  {
                    label: 'All',
                    value: 'all',
                  },
                  {
                    label: 'Today',
                    value: 'today',
                  },
                  {
                    label: 'This Week',
                    value: 'week',
                  },
                  {
                    label: 'Upcoming',
                    value: 'upcoming',
                  },
                ]}
              />
            )}
          </div>
          {/* Matrix */}
          <div className="grid grid-cols-2 h-[80%] mt-6 [&>div]:h-full [&>div]:px-2 [&_h6]:text-xs [&_h6]:font-extrabold [&_h6]:tracking-tighter [&_h6]:text-center [&_h6]:mb-3">
            <div className='border-b-[0.075rem] border-r-[0.075rem]'>
              <h6>Important﹒Urgent</h6>
              <ul>
                {isGoal
                  ? goals
                      ?.filter((goal) => goal.isImportant && goal.isUrgent)
                      .map((goal) => <MatrixItem key={goal.id} {...goal} />)
                  : tasks
                      ?.filter((task) => task.isImportant && task.isUrgent)
                      .map((task) => <MatrixItem key={task.id} {...task} />)}
              </ul>
            </div>
            <div className='border-b-[0.075rem]'>
              <h6>Extra﹒Urgent</h6>
              <ul>
                {isGoal
                  ? goals
                      ?.filter((goal) => goal.isUrgent && !goal.isImportant)
                      .map((goal) => <MatrixItem key={goal.id} {...goal} />)
                  : tasks
                      ?.filter((task) => task.isUrgent && !task.isImportant)
                      .map((task) => <MatrixItem key={task.id} {...task} />)}
              </ul>
            </div>
            <div className='border-r-[0.075rem] pt-4'>
              <h6>Important﹒Later</h6>
              {isGoal
                ? goals
                    ?.filter((goal) => goal.isImportant && !goal.isUrgent)
                    .map((goal) => <MatrixItem key={goal.id} {...goal} />)
                : tasks
                    ?.filter((task) => task.isImportant && !task.isUrgent)
                    .map((task) => <MatrixItem key={task.id} {...task} />)}
            </div>
            <div className='pt-4'>
              <h6>Extra﹒Later</h6>
              {isGoal
                ? goals
                    ?.filter((goal) => !goal.isImportant && !goal.isUrgent)
                    .map((goal) => <MatrixItem key={goal.id} {...goal} />)
                : tasks
                    ?.filter((task) => !task.isImportant && !task.isUrgent)
                    .map((task) => <MatrixItem key={task.id} {...task} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
