'use client';
import DayNav from '@/components/date/DayNav';
import YearMonthNav from '@/components/date/YearMonthNav';
import { eventsAtom } from '@/store/event';
import { notesAtom } from '@/store/note';
import { tasksAtom, taskMutation } from '@/store/task';
import { useAtomValue } from 'jotai';

import { goalsAtom } from '@/store/goals';
import { todayAtom } from '@/store/ui';
import { getDashDate } from '@/util/date';
import ListItem from '../../_components/ListItem';

import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import Loader from '@/components/loader/Loader';
import List from '@/components/list/List';
import { useMemo } from 'react';
import DraggableList from '@/components/draggable/DraggableList';
import { DraggableItem, DragHandle } from '@/components/draggable/DraggableItem';
import { cp } from 'fs';

dayjs.extend(utc);

const Page = () => {
  const today = useAtomValue(todayAtom);

  const { data: tasks, isFetching: isFetchingTasks, refetch: refetchTasks } = useAtomValue(tasksAtom);
  const { data: events, isFetching: isFetchingEvents } = useAtomValue(eventsAtom);
  const { data: notes, isFetching: isFetchingNotes } = useAtomValue(notesAtom);
  const { data: goals, isFetching: isFetchingGoals } = useAtomValue(goalsAtom);

  const overdueArr = useMemo(() => {
    const arr = tasks?.filter(
      (task) =>
        task.status === 'todo' &&
        task.date &&
        (!task.goalId || task.showOutside) &&
        dayjs(getDashDate(task.date)) < dayjs(getDashDate(new Date()))
    ) || [];
    arr.sort((a, b) => b.listRank && a.listRank?.compareTo(b.listRank) || 0 ) || []
    return arr;
  }, [tasks]);

  const taskArr = useMemo(() => {
    const arr = tasks?.filter(
        (task) =>
          task.date &&
          (!task.goalId || task.showOutside) &&
          getDashDate(task.date) === getDashDate(today)
      ) || [];

    arr.sort((a, b) => b.listRank && a.listRank?.compareTo(b.listRank) || 0 ) || []
    return arr;
  } , [today, tasks]);

  const todoArr = useMemo(() => {
    const eventArr =
      events?.filter((event) => getDashDate(event.date) === getDashDate(today)) || [];
    const noteArr =
      notes?.filter((note) => getDashDate(note.date) === getDashDate(today)) || [];
    const todoTaskArr =
      taskArr?.filter((task) => task.status === 'todo' ) || [];

    const arr = [...todoTaskArr, ...eventArr, ...noteArr];
    arr.sort((a, b) => b.listRank && a.listRank?.compareTo(b.listRank) || 0);
    return arr;
  }, [today, taskArr, events, notes]);

  const doneArr = useMemo(() => {
    const arr =taskArr?.filter(
      (task) => (task.status !== 'todo')
    ) || [];
      arr.sort((a, b) => b.listRank && a.listRank?.compareTo(b.listRank) || 0) || []
    return arr;
  }, [taskArr]);

  const pinnedArr = useMemo(() => {
    // const goalArr =
    //   goals?.filter(
    //     (goal) => goal.isPinned && goal.status !== 'done' && goal.status !== 'dismissed'
    //   ) || [];
    const taskArr =
      tasks?.filter(
        (task) =>
          task.status !== 'done' &&
          task.status !== 'dismissed' &&
          task.isPinned &&
          (!task.date || getDashDate(task.date) !== getDashDate(today))
      ) || [];

    const eventArr =
      events?.filter(
        (event) =>
          event.isPinned &&
          event.date &&
          getDashDate(event.date) &&
          dayjs(getDashDate(event.date)!) >= dayjs(getDashDate(new Date())!)
      ) || [];

    const noteArr = notes?.filter((goal) => goal.isPinned) || [];

    const arr = [...taskArr, ...eventArr, ...noteArr];
    arr.sort((a, b) => b.listRank && a.listRank?.compareTo(b.listRank) || 0);
    return arr;
  }, [today, tasks, events, notes, goals]);

  return (
    <div className="h-full p-10 flex flex-col gap-10">
      {/* Header */}
      <div className="mt-4 flex justify-between">
        <YearMonthNav />
        <DayNav />
      </div>
      {!!overdueArr.length && (
        <List
          className="box-content w-full ml-[-1.5rem] [&_li]:text-base [&_svg]:text-xs py-3 px-6 bg-red-50 rounded-xl text-red-400 [&_svg]:text-red-200 [&>div>svg]:text-red-400"
          title="Overdue Tasks"
          items={overdueArr}
          gap={2}
          isFolded={true}
        ></List>
      )}
      {!!todoArr.length && 
        isFetchingTasks || isFetchingEvents || isFetchingNotes || isFetchingGoals ? <div className="w-full h-full flex justify-center items-center">
            <Loader />
          </div> :
        <DraggableList
          items={todoArr}
          rankKey="listRank"
          renderItem={(item) => <DraggableItem id={item.id} className="flex items-center gap-2">
            <DragHandle />
            <ListItem {...item} />
          </DraggableItem>}
          className={`${
            isFetchingTasks || isFetchingEvents || isFetchingNotes || isFetchingGoals
              ? 'h-[80%]'
              : ''
          } space-y-6`}
        />
      }
      {!!doneArr.length && (
        <List
          title="Done"
          className="mt-2 [&>div]:w-[108%] [&>div]:ml-[-4%] [&>div]:border-t-2 [&>div]:border-t-primary [&>div]:py-3 [&>div]:px-2 [&_li]:text-base [&_svg]:text-xs"
          items={doneArr}
          gap={2}
          isFolded={false}
          isRightSideArrow={true}
        />
      )}
      {!!pinnedArr.length && (
        <ul className="box-content w-full ml-[-1.5rem] space-y-4 p-6 bg-gray-50 rounded-xl">
          {pinnedArr?.map((item) => (
            <ListItem key={item.id} {...item} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Page;
