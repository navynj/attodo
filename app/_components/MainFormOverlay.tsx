'use client';

import Button from '@/components/button/Button';
import Loader from '@/components/loader/Loader';
import OverlayForm from '@/components/overlay/OverlayForm';
import Tab from '@/components/tab/Tab';
import { eventMutation } from '@/store/event';
import { goalMutation, goalsAtom, GoalType } from '@/store/goals';
import { noteMutation } from '@/store/note';
import { taskMutation } from '@/store/task';
import { mainFormDataAtom, todayAtom } from '@/store/ui';
import { getDateStr } from '@/util/date';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom, useAtomValue } from 'jotai';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { FieldPath, FieldValues, Path, useForm, UseFormReturn } from 'react-hook-form';
import { FaCheckSquare } from 'react-icons/fa';
import {
  FaCalendar,
  FaCheck,
  FaCopy,
  FaFlag,
  FaTrash,
  FaXmark
} from 'react-icons/fa6';
import { TiPin } from 'react-icons/ti';
import * as z from 'zod';

const formSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  title: z.string().nonempty(),
  description: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  isPinned: z.boolean().optional().nullable(),
  projectId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});

export type mainFormSchemaType = z.infer<typeof formSchema>;

const MainFormOverlay = () => {
  const router = useRouter();
  const pathname = usePathname();

  const params = useSearchParams();
  const isOpen = params.get('main-input');
  const typeParam = params.get('type') || '';
  const goalIdParam = params.get('goalId') || '';

  const { data: goals } = useAtomValue(goalsAtom);
  const { mutate: goalMutate, isPending: isGoalPending } = useAtomValue(goalMutation);
  const { mutate: taskMutate, isPending: isTaskPending } = useAtomValue(taskMutation);
  const { mutate: eventMutate, isPending: isEventPending } = useAtomValue(eventMutation);
  const { mutate: noteMutate, isPending: isNotePending } = useAtomValue(noteMutation);
  const [defaultValues, setDefaultValues] = useAtom(mainFormDataAtom);
  const today = useAtomValue(todayAtom);

  const isPending = useMemo(
    () => isGoalPending || isTaskPending || isEventPending || isNotePending,
    [isGoalPending, isTaskPending, isEventPending, isNotePending]
  );

  const form = useForm<mainFormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const submitHandler = async (values: mainFormSchemaType, e?: Event) => {
    e?.preventDefault();

    try {
      switch (values.type) {
        case 'goal':
          goalMutate(values);
          break;
        case 'task':
          taskMutate(values);
          break;
        case 'event':
          eventMutate(values);
          break;
        case 'note':
          noteMutate(values);
          break;
        default:
          console.error('Not valid type');
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const initTypeByPathname = () => {
    if (!defaultValues) {
      if (pathname === '/inbox') {
        form.setValue('type', 'goal');
      } else if (pathname !== '/inbox' && pathname !== '/project') {
        form.setValue('type', 'task');
        if (pathname === '/today') {
          form.setValue('date', today.toISOString());
        }
      }
    }
  };

  // NOTE: Init when form is open/close
  useEffect(() => {
    if (isOpen) {
      initTypeByPathname();
    } else {
      form.reset();
      setDefaultValues(undefined);
    }
  }, [isOpen]);

  // NOTE: Init when create/update completed
  useEffect(() => {
    if (!isPending) {
      if (defaultValues) {
        router.back();
      }

      form.reset();
      initTypeByPathname();
      setDefaultValues(undefined);
    }
  }, [isPending]);

  // NOTE: Init default values when update form is open
  useEffect(() => {
    if (defaultValues) {
      for (const keyStr in defaultValues) {
        const key = keyStr as Path<mainFormSchemaType>;
        form.setValue(key, defaultValues[key]);
      }
    } else {
      form.reset();
    }

    if (goalIdParam) {
      form.setValue('goalId', goalIdParam);
    }
  }, [defaultValues, goalIdParam]);

  // NOTE: Init type by param
  useEffect(() => {
    form.setValue('type', typeParam);
  }, [typeParam]);

  // NOTE: Init form when type changes
  useEffect(() => {
    const title = form.getValues().title;
    const type = form.getValues().type;

    if (!defaultValues) {
      form.reset({
        type,
        title,
        status: ['project', 'goal', 'task'].includes(type) ? 'todo' : undefined,
        date: ['task', 'event'].includes(type) ? today.toISOString() : undefined,
      });
    }
  }, [form.watch('type')]);

  // NOTE: isPinned with date not allowed
  useEffect(() => {
    const isPinned = form.watch('isPinned');

    if (isPinned) {
      form.setValue('date', null);
    }
  }, [form.watch('isPinned')]);

  useEffect(() => {
    const date = form.watch('date');

    if (date) {
      form.setValue('isPinned', false);
    }
  }, [form.watch('date')]);

  const updateStatus = (status: string) => {
    form.setValue('status', status);
  };

  return (
    <OverlayForm<mainFormSchemaType>
      id="main-input"
      form={form}
      onSubmit={submitHandler}
      hideX={true}
      hideButtons={true}
      disalbeBackOnSubmit={true}
      onClose={() => {
        setDefaultValues(undefined);
      }}
    >
      {!defaultValues && (
        <Tab<mainFormSchemaType>
          id="type"
          className="text-sm"
          form={form}
          tabs={[
            // {
            //   label: 'Project',
            //   value: 'project',
            // },
            {
              label: 'Goalss',
              value: 'goal',
            },
            {
              label: 'Task',
              value: 'task',
            },
            {
              label: 'Event',
              value: 'event',
            },
            {
              label: 'Note',
              value: 'note',
            },
          ]}
        />
      )}
      <div className="relative my-2">
        {form.watch('type') && form.watch('type') !== 'project' && (
          <>
            <input
              id="isPinned"
              type="checkbox"
              className="hidden"
              {...form.register('isPinned')}
            />
            <label
              htmlFor="isPinned"
              className="absolute top-[50%] transform translate-y-[-50%] left-[0.5rem] text-lg"
            >
              <TiPin className={form.watch('isPinned') ? undefined : 'text-gray-300'} />
            </label>
          </>
        )}

        <input
          className={`w-full bg-gray-100 px-3 py-2 ${
            form.watch('type') && form.watch('type') !== 'project' ? 'pl-[2rem]' : ''
          } ${defaultValues ? 'pr-[4.5rem]' : 'pr-[4rem]'} text-lg rounded-md`}
          placeholder="Enter the title"
          {...form.register('title')}
        />
        <Button
          type="submit"
          className={`absolute top-[50%] transform translate-y-[-50%] right-[0.5rem] p-1 ${
            defaultValues ? 'w-[3.5rem]' : 'w-[3rem]'
          } text-center text-xs ${isPending ? 'opacity-25' : ''}`}
          disabled={isPending}
        >
          {isPending ? (
            <Loader isDark={true} className="w-4 h-4" />
          ) : defaultValues ? (
            'Update'
          ) : (
            'Add'
          )}
        </Button>
      </div>
      {form.watch('type') === 'project' && <ProjectFields form={form} />}
      {form.watch('type') === 'goal' && <GoalFields form={form} />}
      {form.watch('type') === 'task' && <TaskFields form={form} goals={goals} />}
      {form.watch('type') === 'event' && <EventFields form={form} />}
      {form.watch('type') === 'note' && <NoteFields form={form} />}
      <div className="space-y-2 my-2">
        {Object.keys(form.formState.errors).map((key) => (
          <div
            key={key}
            className="w-full p-2 text-sm bg-red-50 text-red-400 font-bold text-center rounded-lg"
          >
            {form.formState.errors[key as FieldPath<mainFormSchemaType>]?.message
              ?.split('\n')
              .map((line, i) => (
                <p key={i}>
                  <strong>{key}: </strong>
                  {line}
                </p>
              ))}
          </div>
        ))}
      </div>
      {['project', 'goal', 'task'].includes(form.watch('type')) && (
        <div className="flex justify-center gap-1 bg-gray-100 rounded-md items-center p-[0.2rem] font-extrabold text-xs">
          <button
            type="button"
            className={`w-full py-[0.375rem] flex justify-center items-center gap-2 rounded-md ${
              form.watch('status') === 'todo' ? 'text-primary bg-white' : 'text-gray-400'
            }`}
            disabled={form.watch('status') === 'todo'}
            onClick={updateStatus.bind(null, 'todo')}
          >
            <FaCheckSquare />
            <span>Todo</span>
          </button>
          <button
            type="button"
            className={`w-full py-[0.375rem] flex justify-center items-center gap-2 rounded-md ${
              form.watch('status') === 'dismissed'
                ? 'text-primary bg-white'
                : 'text-gray-400'
            }`}
            disabled={form.watch('status') === 'dismissed'}
            onClick={updateStatus.bind(null, 'dismissed')}
          >
            <FaXmark />
            <span>Dismiss</span>
          </button>
          <button
            type="button"
            className={`w-full py-[0.375rem] flex justify-center items-center gap-2 rounded-md ${
              form.watch('status') === 'done' ? 'text-primary bg-white' : 'text-gray-400'
            }`}
            disabled={form.watch('status') === 'done'}
            onClick={updateStatus.bind(null, 'done')}
          >
            <FaCheck />
            <span>Done</span>
          </button>
        </div>
      )}
      {defaultValues && !isPending && (
        <div className="flex justify-between items-center gap-1 mt-4 [&>*]:w-full [&>*]:py-2 font-extrabold text-xs text-gray-400">
          <Link
            href={`${pathname}?${params.toString()}&delete-confirm=show`}
            type="button"
            className="flex justify-center items-center gap-2"
          >
            <FaTrash /> <span>Delete</span>
          </Link>
          {form.watch('type') === 'task' && (
            <Link
              href={`${pathname}?${params.toString()}&task-date-input=show&mode=duplicate`}
              className="flex justify-center items-center gap-2"
            >
              <FaCopy /> <span>Duplicate</span>
            </Link>
          )}
        </div>
      )}
    </OverlayForm>
  );
};

// Fields
interface FieldProps<T extends FieldValues> {
  form: UseFormReturn<T, any, undefined>;
}

const ProjectFields = ({ form }: FieldProps<mainFormSchemaType>) => {
  const startDatePickerRef = useRef<HTMLInputElement | null>(null);
  const dueDatePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <div
        className="relative flex p-1 gap-3 items-center cursor-pointer"
        onClick={() => {
          startDatePickerRef.current?.showPicker();
        }}
      >
        <FaCalendar className="text-sm" />
        {getDateStr(form.watch('startDate')) || (
          <span className="text-gray-300">No start date</span>
        )}
        <input
          className="opacity-0 absolute w-full"
          type="datetime-local"
          {...form.register('startDate')}
          ref={(e) => {
            form.register('startDate').ref(e);
            startDatePickerRef.current = e;
          }}
        />
      </div>
      <div
        className="relative flex p-1 gap-3 items-center cursor-pointer"
        onClick={() => {
          dueDatePickerRef.current?.showPicker();
        }}
      >
        <FaCalendar className="text-sm" />
        {getDateStr(form.watch('dueDate')) || (
          <span className="text-gray-300">No due date</span>
        )}
        <input
          className="opacity-0 absolute w-full"
          type="datetime-local"
          {...form.register('dueDate')}
          ref={(e) => {
            form.register('dueDate').ref(e);
            dueDatePickerRef.current = e;
          }}
        />
      </div>
    </>
  );
};

const GoalFields = ({ form }: FieldProps<mainFormSchemaType>) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <div
      className="relative flex px-1 py-2 gap-3 items-center cursor-pointer"
      onClick={() => {
        datePickerRef.current?.showPicker();
      }}
    >
      <FaCalendar className="text-sm" />
      {getDateStr(form.watch('dueDate')) || (
        <span className="text-gray-300">No due date</span>
      )}
      <input
        className="opacity-0 absolute w-full"
        type="datetime-local"
        {...form.register('dueDate')}
        ref={(e) => {
          form.register('dueDate').ref(e);
          datePickerRef.current = e;
        }}
      />
    </div>
  );
};

const TaskFields = ({
  form,
  goals,
}: {
  form: UseFormReturn<mainFormSchemaType, any, undefined>;
  goals?: GoalType[];
}) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <div
        className="relative w-full flex px-1 py-2 gap-3 items-center cursor-pointer"
        onClick={() => {
          datePickerRef.current?.showPicker();
        }}
      >
        <FaCalendar className="text-sm" />
        {getDateStr(form.watch('date')) || <span className="text-gray-300">No date</span>}
        <input
          className="opacity-0 absolute w-full"
          type="datetime-local"
          {...form.register('date')}
          ref={(e) => {
            form.register('date').ref(e);
            datePickerRef.current = e;
          }}
        />
      </div>
      <div className="relative w-full flex px-1 py-2 gap-3 items-center cursor-pointer">
        <FaFlag className="text-sm" />
        <select
          {...form.register('goalId')}
          className={`w-full ${form.watch('goalId') ? '' : 'text-gray-300'}`}
        >
          <option value="">No goal</option>
          {goals?.map(
            (goal) =>
              goal.status === 'todo' && (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              )
          )}
        </select>
      </div>
    </>
  );
};

const EventFields = <T extends FieldValues>({ form }: FieldProps<mainFormSchemaType>) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <div
      className="relative flex px-1 py-2 gap-3 items-center cursor-pointer"
      onClick={() => {
        datePickerRef.current?.showPicker();
      }}
    >
      <FaCalendar className="text-sm" />
      {getDateStr(form.watch('date')) || <span className="text-gray-300">No date</span>}
      <input
        className="opacity-0 absolute w-full"
        type="datetime-local"
        {...form.register('date')}
        ref={(e) => {
          form.register('date').ref(e);
          datePickerRef.current = e;
        }}
      />
    </div>
  );
};

const NoteFields = <T extends FieldValues>({ form }: FieldProps<mainFormSchemaType>) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <div
      className="relative flex px-1 py-2 gap-3 items-center cursor-pointer text-sm"
      onClick={() => {
        datePickerRef.current?.showPicker();
      }}
    >
      <FaCalendar />
      {getDateStr(form.watch('date')) || <span className="text-gray-300">No date</span>}
      <input
        className="opacity-0 absolute w-full"
        type="datetime-local"
        {...form.register('date')}
        ref={(e) => {
          form.register('date').ref(e);
          datePickerRef.current = e;
        }}
      />
    </div>
  );
};

export default MainFormOverlay;
