'use client';

import Button from '@/components/button/Button';
import Loader from '@/components/loader/Loader';
import OverlayForm from '@/components/overlay/OverlayForm';
import Tab from '@/components/tab/Tab';
import { eventMutation, eventsAtom } from '@/store/event';
import { goalMutation, goalsAtom, GoalType } from '@/store/goals';
import { noteMutation, notesAtom } from '@/store/note';
import { taskMutation, tasksAtom } from '@/store/task';
import { mainFormDataAtom, todayAtom, typeAtom } from '@/store/ui';
import { createTaskRank, getSortedList } from '@/util/convert';
import { getDashDate, getDateStr } from '@/util/date';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useAtom, useAtomValue } from 'jotai';
import { LexoRank } from 'lexorank';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { FieldPath, FieldValues, Path, useForm, UseFormReturn } from 'react-hook-form';
import { FaCheckSquare } from 'react-icons/fa';
import {
  FaAnchor,
  FaArrowRight,
  FaCalendar,
  FaCheck,
  FaCopy,
  FaFlag,
  FaHashtag,
  FaTrash,
  FaXmark,
} from 'react-icons/fa6';
import { TiPin } from 'react-icons/ti';
import * as z from 'zod';

const formSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  title: z.string().nonempty({ message: 'Title is required.' }),
  description: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  isPinned: z.boolean().optional().nullable(),
  isUrgent: z.boolean().optional().nullable(),
  isImportant: z.boolean().optional().nullable(),
  size: z.preprocess(
    (val) => val || null,
    z.number().min(1).max(4).optional().nullable()
  ),
  weight: z.preprocess(
    (val) => val || null,
    z.number().min(1).max(4).optional().nullable()
  ),
  goalId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  showOutside: z.boolean().optional().nullable(),
  listRank: z.custom<LexoRank>().optional(),
  matrixRank: z.custom<LexoRank>().optional(),
  goalRank: z.custom<LexoRank>().optional(),
});

export type mainFormSchemaType = z.infer<typeof formSchema>;

const MainFormOverlay = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isGoalPage = pathname.includes('goal');

  const params = useSearchParams();
  const isOpen = params.get('main-input');
  const goalIdParam = params.get('goalId') || '';

  const { data: tasks } = useAtomValue(tasksAtom);
  const { data: goals } = useAtomValue(goalsAtom);
  const { data: events } = useAtomValue(eventsAtom);
  const { data: notes } = useAtomValue(notesAtom);
  const { mutate: goalMutate, isPending: isGoalPending } = useAtomValue(goalMutation);
  const { mutate: taskMutate, isPending: isTaskPending } = useAtomValue(taskMutation);
  const { mutate: eventMutate, isPending: isEventPending } = useAtomValue(eventMutation);
  const { mutate: noteMutate, isPending: isNotePending } = useAtomValue(noteMutation);
  const [defaultValues, setDefaultValues] = useAtom(mainFormDataAtom);
  const today = useAtomValue(todayAtom);
  const typeAtomValue = useAtomValue(typeAtom);

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
      let sortedList;
      switch (values.type) {
        case 'goal':
          const sortedGoals = goals
            ?.filter(
              (item) =>
                !!item.isImportant === !!values.isImportant &&
                !!item.isUrgent === !!values.isUrgent
            )
            .sort((a, b) =>
              b.matrixRank ? a.matrixRank?.compareTo(b.matrixRank) || 0 : 0
            );
          goalMutate(
            values.id &&
              defaultValues &&
              !!defaultValues.isImportant === !!values.isImportant &&
              !!defaultValues.isUrgent &&
              !!values.isUrgent
              ? values
              : {
                  ...values,
                  matrixRank:
                    sortedGoals && sortedGoals[sortedGoals.length - 1]
                      ? sortedGoals[sortedGoals.length - 1]?.matrixRank?.genNext() ||
                        LexoRank.middle()
                      : LexoRank.middle(),
                }
          );
          break;
        case 'task':
          taskMutate({...values, ...createTaskRank(values, tasks, events, notes, defaultValues)});
          break;
        case 'event':
          sortedList = getSortedList(tasks, events, notes, values.date);
          eventMutate(
            values.id && defaultValues && getDashDate(values.date) === getDashDate(defaultValues.date)
              ? values
              : {
                  ...values,
                  listRank: !values.date
                    ? undefined
                    : sortedList && sortedList[sortedList.length - 1]
                    ? sortedList[sortedList.length - 1]?.listRank?.genNext() ||
                      LexoRank.middle()
                    : LexoRank.middle(),
                }
          );
          break;
        case 'note':
          sortedList = getSortedList(tasks, events, notes, values.date);
          noteMutate(
            values.id && defaultValues && getDashDate(values.date) === getDashDate(defaultValues.date)
              ? values
              : {
                  ...values,
                  listRank: !values.date
                    ? undefined
                    : sortedList && sortedList[sortedList.length - 1]
                    ? sortedList[sortedList.length - 1]?.listRank?.genNext() ||
                      LexoRank.middle()
                    : LexoRank.middle(),
                }
          );
          break;
        default:
          throw new Error('Not valid type');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const initTypeByPathname = () => {
    if (!defaultValues) {
      if (pathname.includes('goal')) {
        form.setValue('type', 'task');

        const pathnameArr = pathname.split('/');
        form.setValue('goalId', pathnameArr[pathnameArr.length - 1]);
      } else if (pathname === '/inbox') {
        form.setValue('type', 'goal');
      } else if (pathname === '/matrix') {
        form.setValue('type', typeAtomValue);
      } else {
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
      form.reset({});
      setDefaultValues(undefined);
    }
  }, [isOpen]);

  // NOTE: Init when create/update completed
  useEffect(() => {
    if (!isPending) {
      if (defaultValues) {
        router.back();
        form.setValue('type', defaultValues.type);
        if (defaultValues.type === 'task' && pathname === '/today') {
          form.setValue('date', today.toISOString());
        }
      }

      form.reset();
      setDefaultValues(undefined);
    }
  }, [isPending]);

  // NOTE: Init default values when update form is open
  useEffect(() => {
    if (defaultValues) {
      for (const keyStr in defaultValues) {
        const key = keyStr as keyof mainFormSchemaType;
        form.setValue(key, defaultValues[key]);
      }
    } else {
      form.reset();
    }

    if (goalIdParam) {
      form.setValue('goalId', goalIdParam);
    }
  }, [defaultValues, goalIdParam]);


  useEffect(() => {
    if (['/today', '/list'].includes(pathname)) {
      if (form.watch('goalId')) {
        form.setValue('showOutside', true);
      } else {
        form.setValue('showOutside', undefined);
      }
    }
  }, [isGoalPage, form.watch('goalId')]);


  // NOTE: Init form when type changes
  useEffect(() => {
    const title = form.getValues().title;
    const type = form.getValues().type;

    if (!defaultValues) {
      form.reset({
        type,
        title,
        status: ['project', 'goal', 'task'].includes(type) ? 'todo' : undefined,
        date: ['task', 'event', 'note'].includes(type) ? today.toISOString() : undefined,
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

  // NOTE: ShowOutside default value
  useEffect(() => {
    const goalId = form.watch('goalId');

    if (!defaultValues && goalId) {
      if (isGoalPage) {
        form.setValue('showOutside', false);
      } else {
        form.setValue('showOutside', true);
      }
    }
  }, [isGoalPage, form.watch('goalId'), defaultValues]);

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
      isPending={isPending}
    >
      {!defaultValues && (
        <Tab<mainFormSchemaType>
          id="type"
          className="text-sm"
          form={form}
          tabs={[
            {
              label: 'Goals',
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
              disabled={isPending}
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
          disabled={isPending}
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
      {/* {form.watch('type') === 'project' && <ProjectFields form={form} />} */}
      {form.watch('type') === 'goal' && <GoalFields form={form} isPending={isPending} />}
      {form.watch('type') === 'task' && (
        <TaskFields form={form} goals={goals} isPending={isPending} />
      )}
      {form.watch('type') === 'event' && (
        <EventFields form={form} isPending={isPending} />
      )}
      {form.watch('type') === 'note' && <NoteFields form={form} isPending={isPending} />}
      <div className="space-y-2 my-2">
        {Object.keys(form.formState.errors).map((key) => (
          <div
            key={key}
            className="w-full p-2 text-sm bg-red-50 text-red-400 font-bold text-center rounded-lg"
          >
            {form.formState.errors[key as keyof mainFormSchemaType]?.message
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
      {['goal', 'task'].includes(form.watch('type')) && (
        <div className="flex justify-center gap-1 bg-gray-100 rounded-md items-center p-[0.2rem] font-extrabold text-xs">
          <button
            type="button"
            className={`w-full py-[0.375rem] flex justify-center items-center gap-2 rounded-md ${
              form.watch('status') === 'todo' ? 'text-primary bg-white' : 'text-gray-400'
            }`}
            disabled={form.watch('status') === 'todo' || isPending}
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
            disabled={form.watch('status') === 'dismissed' || isPending}
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
            disabled={form.watch('status') === 'done' || isPending}
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
            className="flex justify-center items-center gap-2"
          >
            <FaTrash /> <span>Delete</span>
          </Link>
          {form.watch('type') === 'task' && (
            <>
              {defaultValues.status === 'todo' &&
                dayjs(getDashDate(defaultValues.date)) <
                  dayjs(getDashDate(new Date())) && (
                  <button
                    type="button"
                    className="flex justify-center items-center gap-2"
                    onClick={() => {
                      taskMutate({
                        id: defaultValues.id,
                        date: dayjs(today).toISOString(),
                      });
                    }}
                  >
                    <FaArrowRight /> <span>Move here</span>
                  </button>
                )}
              {!(
                defaultValues.status === 'todo' &&
                dayjs(getDashDate(defaultValues.date)) < dayjs(getDashDate(new Date()))
              ) && (
                <button
                  type="button"
                  className="flex justify-center items-center gap-2"
                  onClick={() => {
                    taskMutate({
                      id: defaultValues.id,
                      date: dayjs(defaultValues.date).add(1, 'day').toISOString(),
                    });
                  }}
                >
                  <FaArrowRight /> <span>Move next</span>
                </button>
              )}
              {isGoalPage ? (
                <button
                  type="button"
                  className="flex justify-center items-center gap-2"
                  onClick={() => {
                    taskMutate(defaultValues);
                  }}
                >
                  <FaCopy /> <span>Duplicate</span>
                </button>
              ) : (
                <Link
                  href={`${pathname}?${params.toString()}&task-date-input=show&mode=duplicate`}
                  className="flex justify-center items-center gap-2"
                >
                  <FaCopy /> <span>Duplicate</span>
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </OverlayForm>
  );
};

// Fields
interface FieldProps<T extends FieldValues> {
  form: UseFormReturn<T, any, undefined>;
  isPending: boolean;
}

const GoalFields = ({ form, isPending }: FieldProps<mainFormSchemaType>) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <div className="w-full flex px-1 py-2 justify-between items-center cursor-pointer">
        <div
          className="relative w-full flex gap-3 items-center"
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
            disabled={isPending}
          />
        </div>
        <FaXmark
          className="text-sm"
          onClick={() => {
            form.setValue('date', null);
          }}
        />
      </div>

      <div className="flex gap-8 font-semibold items-center px-1 py-2">
        <div className="shrink-0 flex gap-1 items-center">
          <input
            id="task-urgency"
            type="checkbox"
            {...form.register('isUrgent')}
            disabled={isPending}
          />
          <label
            htmlFor="task-urgency"
            className={`w-full ${form.watch('isUrgent') ? '' : 'text-gray-300'}`}
          >
            Urgent
          </label>
        </div>
        <div className="shrink-0 flex gap-1 items-center">
          <input
            id="task-importance"
            type="checkbox"
            {...form.register('isImportant')}
            disabled={isPending}
          />
          <label
            htmlFor="task-importance"
            className={`w-full ${form.watch('isImportant') ? '' : 'text-gray-300'}`}
          >
            Important
          </label>
        </div>
      </div>
      <div className="flex gap-8 px-1 py-2 ">
        <div className="flex gap-2 items-center">
          <FaHashtag className="text-sm" />
          <select
            {...form.register('size', { valueAsNumber: true })}
            className={`w-full ${form.watch('size') ? '' : 'text-gray-300'}`}
            disabled={isPending}
          >
            <option value="" defaultValue="">
              No Size
            </option>
            {Array.from(new Array(4)).map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <FaAnchor />
          <select
            {...form.register('weight', { valueAsNumber: true })}
            className={`w-full ${form.watch('weight') ? '' : 'text-gray-300'}`}
            disabled={isPending}
          >
            <option value="" defaultValue="">
              No Weight
            </option>
            {Array.from(new Array(4)).map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

const TaskFields = ({
  form,
  goals,
  isPending,
}: FieldProps<mainFormSchemaType> & { goals?: GoalType[] }) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <div className="w-full flex px-1 py-2 justify-between items-center cursor-pointer">
        <div
          className="relative w-full flex gap-3 items-center"
          onClick={() => {
            datePickerRef.current?.showPicker();
          }}
        >
          <FaCalendar className="text-sm" />
          {getDateStr(form.watch('date')) || (
            <span className="text-gray-300">No date</span>
          )}
          <input
            className="opacity-0 absolute w-full"
            type="datetime-local"
            {...form.register('date')}
            ref={(e) => {
              form.register('date').ref(e);
              datePickerRef.current = e;
            }}
            disabled={isPending}
          />
        </div>
        <FaXmark
          className="text-sm"
          onClick={() => {
            form.setValue('date', null);
          }}
        />
      </div>
      <div className="relative w-full flex px-1 py-2 gap-3 items-center cursor-pointer">
        <FaFlag className="text-sm" />
        <select
          {...form.register('goalId')}
          className={`w-full ${form.watch('goalId') ? '' : 'text-gray-300'}`}
          disabled={isPending}
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
        <div className="shrink-0 flex gap-1 items-center">
          <input
            id="task-show-outside"
            type="checkbox"
            {...form.register('showOutside')}
            disabled={isPending}
          />
          <label
            htmlFor="task-show-outside"
            className={`w-full text-xs ${
              form.watch('showOutside') ? '' : 'text-gray-300'
            }`}
          >
            Show Outside
          </label>
        </div>
      </div>
      <div className="flex gap-8 font-semibold items-center px-1 py-2">
        <div className="shrink-0 flex gap-1 items-center">
          <input
            id="task-urgency"
            type="checkbox"
            {...form.register('isUrgent')}
            disabled={isPending}
          />
          <label
            htmlFor="task-urgency"
            className={`w-full ${form.watch('isUrgent') ? '' : 'text-gray-300'}`}
          >
            Urgent
          </label>
        </div>
        <div className="shrink-0 flex gap-1 items-center">
          <input
            id="task-importance"
            type="checkbox"
            {...form.register('isImportant')}
            disabled={isPending}
          />
          <label
            htmlFor="task-importance"
            className={`w-full ${form.watch('isImportant') ? '' : 'text-gray-300'}`}
          >
            Important
          </label>
        </div>
      </div>

      <div className="flex gap-8 px-1 py-2 ">
        <div className="flex gap-2 items-center">
          <FaHashtag className="text-sm" />
          <select
            {...form.register('size', { valueAsNumber: true })}
            className={`w-full ${form.watch('size') ? '' : 'text-gray-300'}`}
            disabled={isPending}
          >
            <option value="" defaultValue="">
              No Size
            </option>
            {Array.from(new Array(4)).map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <FaAnchor />
          <select
            {...form.register('weight', { valueAsNumber: true })}
            className={`w-full ${form.watch('weight') ? '' : 'text-gray-300'}`}
            disabled={isPending}
          >
            <option value="" defaultValue="">
              No Weight
            </option>
            {Array.from(new Array(4)).map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

const EventFields = ({ form, isPending }: FieldProps<mainFormSchemaType>) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="w-full flex px-1 py-2 justify-between items-center cursor-pointer">
      <div
        className="relative w-full flex gap-3 items-center"
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
          disabled={isPending}
        />
      </div>
      <FaXmark
        className="text-sm"
        onClick={() => {
          form.setValue('date', null);
        }}
      />
    </div>
  );
};

const NoteFields = ({ form, isPending }: FieldProps<mainFormSchemaType>) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="w-full flex px-1 py-2 justify-between items-center cursor-pointer">
      <div
        className="relative w-full flex gap-3 items-center"
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
          disabled={isPending}
        />
      </div>
      <FaXmark
        className="text-sm"
        onClick={() => {
          form.setValue('date', null);
        }}
      />
    </div>
  );
};

export default MainFormOverlay;
