'use client';

import Button from '@/components/button/Button';
import OverlayForm from '@/components/overlay/OverlayForm';
import Tab from '@/components/tab/Tab';
import { formDataAtom } from '@/store/ui';
import { getDashDate } from '@/util/date';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FieldValues, Path, useForm, UseFormReturn } from 'react-hook-form';
import { FaCalendar } from 'react-icons/fa6';
import { TiPin } from 'react-icons/ti';
import * as z from 'zod';

const formSchema = z.object({
  type: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  isPinned: z.boolean().optional(),
});

type formSchemaType = z.infer<typeof formSchema>;

const MainInputOverlay = () => {
  const params = useSearchParams();
  const id = params.get('id') || '';
  const typeParam = params.get('type') || '';
  const goalIdParam = params.get('goalId') || '';

  const [defaultValues, setFormData] = useAtom(formDataAtom);

  const [projectId, setProjectId] = useState(defaultValues?.projectId);
  const [goalId, setGoalId] = useState(defaultValues?.goalId || goalIdParam);

  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const submitHandler = async (values: formSchemaType, e?: Event) => {
    console.log(values);
    form.reset();
    setFormData(undefined);
  };

  // NOTE: Init default values (In case of update)
  useEffect(() => {
    for (const key in defaultValues) {
      if (defaultValues[key] instanceof Date) {
        form.setValue(key as Path<formSchemaType>, getDashDate(defaultValues[key]));
      } else {
        form.setValue(key as Path<formSchemaType>, defaultValues[key]);
      }
    }
  }, [defaultValues]);

  useEffect(() => {
    form.setValue('type', typeParam);
  }, [typeParam]);

  return (
    <OverlayForm<formSchemaType>
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
      <Tab<formSchemaType>
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
        enableToggle={true}
      />
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
          } ${id ? 'pr-[4.5rem]' : 'pr-[4rem]'} text-lg rounded-md`}
          placeholder="Enter the title"
          {...form.register('title')}
        />
        <Button
          type="submit"
          className={`absolute top-[50%] transform translate-y-[-50%] right-[0.5rem] p-1 ${
            id ? 'w-[3.5rem]' : 'w-[3rem]'
          } text-center text-xs`}
        >
          {id ? 'Update' : 'Add'}
        </Button>
      </div>
      {form.watch('type') === 'project' && <ProjectFields form={form} />}
      {form.watch('type') === 'goal' && <GoalFields form={form} />}
      {form.watch('type') === 'task' && <TaskFields form={form} />}
      {form.watch('type') === 'event' && <EventFields form={form} />}
      {form.watch('type') === 'note' && <NoteFields form={form} />}
    </OverlayForm>
  );
};

// Fields
interface FieldProps<formSchemaType extends FieldValues> {
  form: UseFormReturn<formSchemaType, any, undefined>;
}

const ProjectFields = ({ form }: FieldProps<formSchemaType>) => {
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
          type="date"
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

const GoalFields = ({ form }: FieldProps<formSchemaType>) => {
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
        type="date"
        {...form.register('dueDate')}
        ref={(e) => {
          form.register('dueDate').ref(e);
          datePickerRef.current = e;
        }}
      />
    </div>
  );
};

const TaskFields = ({ form }: FieldProps<formSchemaType>) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <div
      className="relative flex px-1 py-2 gap-3 items-center cursor-pointer"
      onClick={() => {
        datePickerRef.current?.showPicker();
      }}
    >
      <FaCalendar className="text-sm" />
      {form.watch('date') || <span className="text-gray-300">No date</span>}
      <input
        className="opacity-0 pointer-events-none absolute w-full"
        type="date"
        {...form.register('date')}
        ref={(e) => {
          form.register('date').ref(e);
          datePickerRef.current = e;
        }}
      />
    </div>
  );
};

const EventFields = <T extends FieldValues>({ form }: FieldProps<formSchemaType>) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <div
      className="relative flex px-1 py-2 gap-3 items-center cursor-pointer"
      onClick={() => {
        datePickerRef.current?.showPicker();
      }}
    >
      <FaCalendar className="text-sm" />
      {form.watch('date') || <span className="text-gray-300">No date</span>}
      <input
        className="opacity-0 pointer-events-none absolute w-full"
        type="date"
        {...form.register('date')}
        ref={(e) => {
          form.register('date').ref(e);
          datePickerRef.current = e;
        }}
      />
    </div>
  );
};

const NoteFields = <T extends FieldValues>({ form }: FieldProps<formSchemaType>) => {
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  return (
    <div
      className="relative flex px-1 py-2 gap-3 items-center cursor-pointer text-sm"
      onClick={() => {
        datePickerRef.current?.showPicker();
      }}
    >
      <FaCalendar />
      {form.watch('date') || <span className="text-gray-300">No date</span>}
      <input
        className="opacity-0 pointer-events-none absolute w-full"
        type="date"
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
