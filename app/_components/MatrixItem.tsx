import { EventType } from '@/store/event';
import { GoalType } from '@/store/goals';
import { NoteType } from '@/store/note';
import { taskMutation, TaskStatusType, TaskType } from '@/store/task';
import { mainFormDataAtom } from '@/store/ui';
import dayjs from 'dayjs';
import { useAtomValue, useSetAtom } from 'jotai';
import Link from 'next/link';
import { useState } from 'react';
import { FaCheckSquare } from 'react-icons/fa';
import { FaArrowRight, FaFlag, FaSquare, FaXmark } from 'react-icons/fa6';

const MatrixItem = (item: GoalType | NoteType | TaskType | EventType) => {
  const setFormData = useSetAtom(mainFormDataAtom);
  const { type, id, title } = item;

  return type === 'goal' ? (
    <GoalItem {...item} />
  ) : (
    <div className="flex items-center gap-2 py-2">
      {type === 'task' && <TaskIcon id={id} status={item.status} />}{' '}
      <Link
        className="w-full h-full"
        href={`?main-input=show`}
        onClick={() => {
          setFormData(item);
        }}
      >
        {type === 'task' && item.goal && (
          <div className="flex items-center gap-[0.3rem] text-xs font-extrabold">
            <FaFlag className="!text-[0.5rem]" />
            <p>
              {item.goal.title}
              {item.goal.dueDate && (
                <>
                  {'﹒~'}
                  {dayjs(item.goal.dueDate).format('MMM D')}
                </>
              )}
            </p>
          </div>
        )}
        <p className="text-sm">{title}</p>
      </Link>
    </div>
  );
};

const TaskIcon = ({ id, status: statusProps }: Pick<TaskType, 'id' | 'status'>) => {
  const { mutate } = useAtomValue(taskMutation);
  const [status, setStatus] = useState(statusProps);

  const updateStatus = async (statusStr: TaskStatusType) => {
    setStatus(statusStr);

    try {
      mutate({ id, status: statusStr });
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
  const setFormData = useSetAtom(mainFormDataAtom);
  const { title } = item;

  return (
    <div className="flex justify-between items-center gap-4 py-1 text-sm">
      <Link
        href={`?main-input=show`}
        className="w-full"
        onClick={() => {
          setFormData(item);
        }}
      >
        {title}
      </Link>
    </div>
  );
};

export default MatrixItem;