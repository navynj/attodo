import Button from '@/components/button/Button';
import { EventType } from '@/store/event';
import { GoalType } from '@/store/goals';
import { NoteType } from '@/store/note';
import { tasksAtom, TaskStatusType, TaskType } from '@/store/task';
import { mainFormDataAtom } from '@/store/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BsDash, BsDot } from 'react-icons/bs';
import { FaCheckSquare } from 'react-icons/fa';
import { FaArrowRight, FaSquare, FaXmark } from 'react-icons/fa6';

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

const TaskIcon = ({ id, status: statusProps }: Pick<TaskType, 'id' | 'status'>) => {
  const { refetch } = useAtomValue(tasksAtom);
  const [status, setStatus] = useState(statusProps);

  const updateStatus = async (statusStr: TaskStatusType) => {
    setStatus(statusStr);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/task/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusStr }),
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
      {status === 'dismissed' && <FaXmark />}
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
