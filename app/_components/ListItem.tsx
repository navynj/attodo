import { GoalType } from '@/store/goals';
import { NoteType } from '@/store/note';
import { TaskType } from '@/store/task';
import { EventType } from '@/store/event';
import Link from 'next/link';
import React from 'react';
import { BsDash, BsDot } from 'react-icons/bs';
import { FaArrowRight, FaSquare, FaX, FaXmark } from 'react-icons/fa6';
import Button from '@/components/button/Button';
import { formDataAtom } from '@/store/ui';
import { useSetAtom } from 'jotai';
import { redirect, useRouter } from 'next/navigation';
import { FaCheckSquare } from 'react-icons/fa';

const ListItem = (item: GoalType | NoteType | TaskType | EventType) => {
  const setFormData = useSetAtom(formDataAtom);
  const { type, id, title } = item;

  return type === 'goal' ? (
    <GoalItem {...item} />
  ) : (
    <Link
      className="flex items-center gap-4"
      href={`?main-input=show&id=${id}`}
      onClick={() => {
        setFormData(item);
      }}
    >
      {type === 'task' ? (
        <TaskIcon id={id} status={item.status} />
      ) : (
        <>
          {type === 'event' && <BsDot className="text-gray-300" />}
          {type === 'note' && <BsDash className="text-gray-300" />}
        </>
      )}{' '}
      <span>{title}</span>
    </Link>
  );
};

const TaskIcon = ({ id, status }: Partial<TaskType>) => {
  const toggleDone = () => {
    // TODO: Implement toggleDone
  };
  return (
    <>
      {status === 'todo' && (
        <FaSquare className="text-gray-200 text-sm" onClick={toggleDone} />
      )}
      {status === 'done' && <FaCheckSquare className="text-sm" onClick={toggleDone} />}
      {status === 'delayed' && <FaArrowRight className="text-gray-300" />}
      {status === 'dismissed' && <FaXmark className="text-gray-300" />}
    </>
  );
};

const GoalItem = (item: GoalType) => {
  const router = useRouter();
  const setFormData = useSetAtom(formDataAtom);
  const { type, id, title } = item;

  return (
    <div className="flex justify-between items-center gap-4">
      <Link
        href={`?main-input=show&id=${id}`}
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
