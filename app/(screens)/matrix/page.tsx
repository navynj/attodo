'use client';

import Loader from '@/components/loader/Loader';
import Tab from '@/components/tab/Tab';
import { goalsAtom, GoalType } from '@/store/goals';
import { tasksAtom, TaskType } from '@/store/task';
import { typeAtom } from '@/store/ui';
import { getDashDate } from '@/util/date';
import dayjs from 'dayjs';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import MatrixItem from '../../_components/MatrixItem';
import DraggableList from '@/components/draggable/DraggableList';
import { DraggableItem, DragHandle } from '@/components/draggable/DraggableItem';

const Page = () => {
  const { data: goalData, isFetching: isFetchingGoals } = useAtomValue(goalsAtom);
  const { data: taskData, isFetching: isFetchingTasks } = useAtomValue(tasksAtom);
  const setType = useSetAtom(typeAtom);

  const [isGoal, setIsGoal] = useState(true);
  const [statusFilter, setStatusFilter] = useState('todo');
  const [dateFilter, setDateFilter] = useState('all');

  const goals = useMemo(
    () =>
      goalData
        ?.filter((goal) => {
          switch (statusFilter) {
            case 'todo':
              return goal.status === 'todo';
            case 'done':
              return goal.status === 'done';
          }
        })
        .sort((a, b) => (b.matrixRank ? a.matrixRank?.compareTo(b.matrixRank) || 0 : 0)),
    [goalData, statusFilter]
  );

  const tasks = useMemo(() => {
    const taskMatrixList = taskData
      ?.filter((task) => {
        if (task.goalId && !task.showOutside) {
          return false;
        }

        switch (statusFilter) {
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
      .filter((task) => {
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
      });

    if (statusFilter === 'done') {
      taskMatrixList?.sort((a, b) =>
        a.date
          ? getDashDate(a.date) === getDashDate(b.date)
            ? (b.matrixRank && a.matrixRank?.compareTo(b.matrixRank)) || 0
            : dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
          : 0
      );
    } else {
      taskMatrixList?.sort(
        (a, b) => (b.matrixRank && a.matrixRank?.compareTo(b.matrixRank)) || -1
      );
    }

    return taskMatrixList;
  }, [taskData, statusFilter, dateFilter]);

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
              onClick={() => {
                setIsGoal(true);
                setType('goal');
              }}
              className={isGoal ? '' : 'text-gray-300'}
            >
              Goals
            </button>
            <button
              onClick={() => {
                setIsGoal(false);
                setType('task');
              }}
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
            <div className="border-b-[0.075rem] border-r-[0.075rem]">
              <h6>Important﹒Urgent</h6>
              {statusFilter !== 'todo' ? (
                <ul>
                  {isGoal
                    ? goals
                        ?.filter((goal) => goal.isUrgent && goal.isImportant)
                        .map((goal) => <MatrixItem key={goal.id} {...goal} />)
                    : tasks
                        ?.filter((task) => task.isUrgent && task.isImportant)
                        .map((task) => <MatrixItem key={task.id} {...task} />)}
                </ul>
              ) : (
                <DraggableList<GoalType | TaskType>
                  items={
                    isGoal
                      ? goals?.filter((goal) => goal.isImportant && goal.isUrgent) || []
                      : tasks?.filter((task) => task.isImportant && task.isUrgent) || []
                  }
                  rankKey="matrixRank"
                  renderItem={(item) => (
                    <DraggableItem id={item.id} className="flex items-center gap-2">
                      <DragHandle />
                      <MatrixItem {...item} />
                    </DraggableItem>
                  )}
                />
              )}
            </div>
            <div className="border-b-[0.075rem]">
              <h6>Extra﹒Urgent</h6>
              {statusFilter !== 'todo' ? (
                <ul>
                  {isGoal
                    ? goals
                        ?.filter((goal) => goal.isUrgent && !goal.isImportant)
                        .map((goal) => <MatrixItem key={goal.id} {...goal} />)
                    : tasks
                        ?.filter((task) => task.isUrgent && !task.isImportant)
                        .map((task) => <MatrixItem key={task.id} {...task} />)}
                </ul>
              ) : (
                <DraggableList<GoalType | TaskType>
                  items={
                    isGoal
                      ? goals?.filter((goal) => goal.isUrgent && !goal.isImportant ) || []
                      : tasks?.filter((task) => task.isUrgent && !task.isImportant) || []
                  }
                  rankKey="matrixRank"
                  renderItem={(item) => (
                    <DraggableItem id={item.id} className="flex items-center gap-2">
                      <DragHandle />
                      <MatrixItem {...item} />
                    </DraggableItem>
                  )}
                />
              )}
            </div>
            <div className="border-r-[0.075rem] pt-4">
              <h6>Important﹒Later</h6>
              {statusFilter !== 'todo' ? (
                <ul>
                  {isGoal
                    ? goals
                        ?.filter((goal) => !goal.isUrgent && goal.isImportant)
                        .map((goal) => <MatrixItem key={goal.id} {...goal} />)
                    : tasks
                        ?.filter((task) => !task.isUrgent && task.isImportant)
                        .map((task) => <MatrixItem key={task.id} {...task} />)}
                </ul>
              ) : (
                <DraggableList<GoalType | TaskType>
                  items={
                    isGoal
                      ? goals?.filter((goal) => !goal.isUrgent && goal.isImportant ) || []
                      : tasks?.filter((task) => !task.isUrgent && task.isImportant) || []
                  }
                  rankKey="matrixRank"
                  renderItem={(item) => (
                    <DraggableItem id={item.id} className="flex items-center gap-2">
                      <DragHandle />
                      <MatrixItem {...item} />
                    </DraggableItem>
                  )}
                />
              )}
            </div>
            <div className="pt-4">
              <h6>Extra﹒Later</h6>
              {statusFilter === 'u' ? (
                <ul>
                  {isGoal
                    ? goals
                        ?.filter((goal) => !goal.isUrgent && !goal.isImportant)
                        .map((goal) => <MatrixItem key={goal.id} {...goal} />)
                    : tasks
                        ?.filter((task) => !task.isUrgent && !task.isImportant)
                        .map((task) => <MatrixItem key={task.id} {...task} />)}
                </ul>
              ) : (
                <DraggableList<GoalType | TaskType>
                  items={
                    isGoal
                      ? goals?.filter((goal) => !goal.isUrgent && !goal.isImportant ) || []
                      : tasks?.filter((task) => !task.isUrgent && !task.isImportant) || []
                  }
                  rankKey="matrixRank"
                  renderItem={(item) => (
                    <DraggableItem id={item.id} className="flex items-center gap-2">
                      <DragHandle />
                      <MatrixItem {...item} />
                    </DraggableItem>
                  )}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
