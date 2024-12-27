import { GoalType } from '@/store/goals';
import { NoteType } from '@/store/note';
import { tasksAtom, TaskType } from '@/store/task';
import { EventType } from '@/store/event';
import Link from 'next/link';
import React from 'react';
import { BsDash, BsDot } from 'react-icons/bs';
import { FaArrowRight, FaSquare, FaX, FaXmark } from 'react-icons/fa6';
import Button from '@/components/button/Button';
import { mainFormDataAtom } from '@/store/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { redirect, useRouter } from 'next/navigation';
import { FaCheckSquare } from 'react-icons/fa';

const ListItem = (item: GoalType | NoteType | TaskType | EventType) => {
  const setFormData = useSetAtom(mainFormDataAtom);
  const { type, id, title } = item;

  return type === 'goal' ? (
    <GoalItem {...item} />
  ) : (
    <div className="flex items-center gap-4">
      {type === 'task' ? (
        <TaskIcon id={id} status={item.status} />
      ) : (
        <>
          {type === 'event' && <BsDot className="text-gray-300" />}
          {type === 'note' && <BsDash className="text-gray-300" />}
        </>
      )}{' '}
      <Link
        className="w-full h-full"
        href={`?main-input=show`}
        onClick={() => {
          setFormData(item);
        }}
      >
        {title}
      </Link>
    </div>
  );
};

const TaskIcon = ({ id, status }: Partial<TaskType>) => {
  const { refetch } = useAtomValue(tasksAtom);
  
  const updateStatus = async (status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/task/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(response.status + ' ' + response.statusText);
      }

      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {status === 'todo' && (
        <FaSquare
          className="text-gray-200 text-sm cursor-pointer"
          onClick={updateStatus.bind(null, 'done')}
        />
      )}
      {status === 'done' && (
        <FaCheckSquare
          className="text-sm cursor-pointer"
          onClick={updateStatus.bind(null, 'todo')}
        />
      )}
      {status === 'delayed' && <FaArrowRight className="text-gray-300" />}
      {status === 'dismissed' && <FaXmark className="text-gray-300" />}
    </>
  );
};

const GoalItem = (item: GoalType) => {
  const router = useRouter();
  const setFormData = useSetAtom(mainFormDataAtom);
  const { type, id, title } = item;

  return (
    <div className="flex justify-between items-center gap-4">
      <Link
        href={`?main-input=show`}
        className="w-full font-bold"
        onClick={() => {
          setFormData(item);
        }}
      >
        {title}
      </Link>
      {type === 'goal' && (
        <Button
          className="px-2 py-1 text-xs rounded-md shrink-0"
          onClick={() => {
            router.push(`?main-input=show&goalId=${id}&type=task`);
          }}
        >
          Add Task
        </Button>
      )}
    </div>
  );
};

export default ListItem;
