'use client';

import Button from '@/components/button/Button';
import OverlayForm from '@/components/overlay/OverlayForm';
import Tab from '@/components/tab/Tab';
import { eventsAtom } from '@/store/event';
import { goalsAtom } from '@/store/goals';
import { notesAtom } from '@/store/note';
import { tasksAtom } from '@/store/task';
import { mainFormDataAtom, todayAtom } from '@/store/ui';
import { getDateStr } from '@/util/date';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom, useAtomValue } from 'jotai';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FieldPath, FieldValues, Path, useForm, UseFormReturn } from 'react-hook-form';
import { FaArrowRight, FaCalendar, FaTrash, FaXmark } from 'react-icons/fa6';
import { TiPin } from 'react-icons/ti';
import * as z from 'zod';

const formSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  isPinned: z.boolean().optional().nullable(),
  projectId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
});

export type mainFormSchemaType = z.infer<typeof formSchema>;

const MainInputOverlay = () => {
  const router = useRouter();
  const pathname = usePathname();

  const params = useSearchParams();
  const isOpen = params.get('main-input');
  const typeParam = params.get('type') || '';
  const goalIdParam = params.get('goalId') || '';

  const { refetch: refetchProjects } = useAtomValue(tasksAtom);
  const { refetch: refetchGoals } = useAtomValue(goalsAtom);
  const { refetch: refetchTasks } = useAtomValue(tasksAtom);
  const { refetch: refetchEvents } = useAtomValue(eventsAtom);
  const { refetch: refetchNotes } = useAtomValue(notesAtom);
  const [defaultValues, setFormData] = useAtom(mainFormDataAtom);
  const today = useAtomValue(todayAtom);

  const form = useForm<mainFormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const submitHandler = async (inputValues: mainFormSchemaType, e?: Event) => {
    e?.preventDefault();

    const values = {
      ...inputValues,
      date: inputValues.date ? new Date(inputValues.date) : undefined,
      dueDate: inputValues.dueDate ? new Date(inputValues.dueDate) : undefined,
      startDate: inputValues.startDate ? new Date(inputValues.startDate) : undefined,
    };
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/${values.type}`;

    if (defaultValues) {
      const response = await fetch(`${url}/${defaultValues.id}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error(response.status + ' ' + response.statusText);
      }
      router.back();
    } else {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          status: values.type !== 'event' && values.type !== 'note' ? 'todo' : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error(response.status + ' ' + response.statusText);
      }
    }

    form.reset();
    !defaultValues && form.setValue('type', values.type);
    !defaultValues && pathname === '/today' && form.setValue('date', today.toISOString());
    console.log(defaultValues ? undefined : { type: values.type });
    setFormData(undefined);
    reset(values.type);
    refetch(values.type);
  };

  const deleteHandler = async ({ id, type }: mainFormSchemaType) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/${type}/${id}`, {
        method: 'DELETE',
      });

      router.back();
      form.reset();
      setFormData(undefined);
      refetch(type);
    } catch (error) {
      throw error;
    }
  };

  const reset = (type?: string) => {};

  const refetch = (type: string) => {
    switch (type) {
      case 'project':
        refetchProjects();
        break;
      case 'goal':
        refetchGoals();
        break;
      case 'task':
        refetchTasks();
        break;
      case 'event':
        refetchEvents();
        break;
      case 'note':
        refetchNotes();
        break;
      default:
        refetchProjects();
        refetchGoals();
        refetchTasks();
        refetchEvents();
        refetchNotes();
    }
  };

  const initTypeByPathname = () => {
    if (pathname === '/inbox') {
      form.setValue('type', 'goal');
    } else if (pathname !== '/inbox' && pathname !== '/project') {
      form.setValue('type', 'task');
      if (pathname === '/today') {
        form.setValue('date', today.toISOString());
      }
    }
  };

  // NOTE: Init default values (In case of update)
  useEffect(() => {
    for (const keyStr in defaultValues) {
      const key = keyStr as Path<mainFormSchemaType>;
      form.setValue(key, defaultValues[key]);

      if (goalIdParam) {
        form.setValue('goalId', goalIdParam);
      }
    }
  }, [defaultValues]);

  useEffect(() => {
    form.setValue('type', typeParam);
  }, [typeParam]);

  useEffect(() => {
    if (isOpen) {
      if (!defaultValues) {
        initTypeByPathname();
      }
    } else {
      form.reset();
      setFormData(undefined);
    }
  }, [isOpen]);

  return (
    <OverlayForm<mainFormSchemaType>
      id="main-input"
      form={form}
      onSubmit={submitHandler}
      hideX={true}
      hideButtons={true}
      disalbeBackOnSubmit={true}
      onClose={() => {
        setFormData(undefined);
      }}
    >
      {!defaultValues && (
        <Tab<mainFormSchemaType>
          id="type"
          className="text-sm"
          form={form}
          tabs={[
            {
              label: 'Project',
              value: 'project',
            },
            {
              label: 'Goal',
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
          } text-center text-xs`}
        >
          {defaultValues ? 'Update' : 'Add'}
        </Button>
      </div>
      {form.watch('type') === 'project' && <ProjectFields form={form} />}
      {form.watch('type') === 'goal' && <GoalFields form={form} />}
      {form.watch('type') === 'task' && <TaskFields form={form} />}
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
      {defaultValues && (
        <div className="flex justify-center items-center [&>button]:w-full py-2 mt-4 font-extrabold text-xs text-gray-400">
          <button
            className="flex justify-center gap-2"
            onClick={deleteHandler.bind(null, defaultValues)}
          >
            <FaTrash /> <span>Delete</span>
          </button>
          <button className="flex justify-center gap-2">
            <FaXmark /> <span>Dismiss</span>
          </button>
          <button className="flex justify-center gap-2">
            <FaArrowRight /> <span>Delay</span>
          </button>
        </div>
      )}
    </OverlayForm>
  );
};

// Fields
interface FieldProps<formSchemaType extends FieldValues> {
  form: UseFormReturn<formSchemaType, any, undefined>;
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
        {form.watch('startDate') || <span className="text-gray-300">No start date</span>}
        <input
          className="opacity-0 pointer-events-none absolute w-full"
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
        {form.watch('dueDate') || <span className="text-gray-300">No due date</span>}
        <input
          className="opacity-0 pointer-events-none absolute w-full"
          type="date"
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
      {form.watch('dueDate') || <span className="text-gray-300">No due date</span>}
      <input
        className="opacity-0 pointer-events-none absolute w-full"
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

const TaskFields = ({ form }: FieldProps<mainFormSchemaType>) => {
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
        className="opacity-0 pointer-events-none absolute w-full"
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
        className="opacity-0 pointer-events-none absolute w-full"
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
        className="opacity-0 pointer-events-none absolute w-full"
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

export default MainInputOverlay;
