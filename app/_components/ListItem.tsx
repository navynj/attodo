import Button from '@/components/button/Button';
import { EventType } from '@/store/event';
import { GoalType } from '@/store/goals';
import { NoteType } from '@/store/note';
import { taskMutation, TaskStatusType, TaskType } from '@/store/task';
import { mainFormDataAtom, typeAtom } from '@/store/ui';
import dayjs from 'dayjs';
import { useAtomValue, useSetAtom } from 'jotai';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BsDash, BsDot } from 'react-icons/bs';
import { FaCheckSquare } from 'react-icons/fa';
import { FaArrowRight, FaFlag, FaSquare, FaXmark } from 'react-icons/fa6';

const ListItem = (item: GoalType | NoteType | TaskType | EventType) => {
  const { type, id, title } = item;

  const pathname = usePathname();
  const isGoalPage = pathname.includes('goal');

  const setFormData = useSetAtom(mainFormDataAtom);

  return type === 'goal' ? (
    <GoalItem {...item} />
  ) : (
    <div className="flex items-center gap-3">
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
        {type === 'task' && item.goal && !isGoalPage && (
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
        <p>
          {title}
          {isGoalPage && item.date && (
            <span className="text-[0.7rem] font-light shrink-0 ml-2 leading-4">
              <span className="text-[0.6rem]">@</span>
              {dayjs(item.date).format('MMM D')}
            </span>
          )}
        </p>
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
  const router = useRouter();
  const setFormData = useSetAtom(mainFormDataAtom);
    const setType = useSetAtom(typeAtom);  
  const { type, id, title } = item;

  return (
    <div className="flex justify-between items-center gap-3">
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
            router.push(`?main-input=show&goalId=${id}`);
            setType('task');
          }}
        >
          Add Task
        </Button>
      )}
    </div>
  );
};

export default ListItem;
