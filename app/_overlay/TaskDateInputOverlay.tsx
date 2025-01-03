'use client';

import OverlayForm from '@/components/overlay/OverlayForm';
import { eventsAtom } from '@/store/event';
import { notesAtom } from '@/store/note';
import { taskMutation, tasksAtom } from '@/store/task';
import { mainFormDataAtom } from '@/store/ui';
import { createTaskRank } from '@/util/convert';
import { getDateStr } from '@/util/date';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { FieldPath, useForm } from 'react-hook-form';
import { FaCalendar } from 'react-icons/fa';
import * as z from 'zod';
const formSchema = z.object({
  date: z.string().nonempty(),
});

type dateSchemaType = z.infer<typeof formSchema>;

const TaskDateInputOverlay = ({ z: zIndex }: { z?: number }) => {
  const router = useRouter();

  const params = useSearchParams();
  const mode = params.get('mode');

  const { data: tasks } = useAtomValue(tasksAtom);
  const { data: events } = useAtomValue(eventsAtom);
  const { data: notes } = useAtomValue(notesAtom);
  
  const defaultValues = useAtomValue(mainFormDataAtom);
  const { mutate: taskMutate } = useAtomValue(taskMutation);

  const form = useForm<dateSchemaType>({
    resolver: zodResolver(formSchema),
  });

  const datePickerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    defaultValues && form.setValue('date', dayjs(defaultValues.date).add(1, 'day').toISOString());
  }, [defaultValues]);

  const submitHandler = async (values: dateSchemaType) => {
    taskMutate({
      ...defaultValues,
      id: undefined,
      date: values.date,
      createdAt: undefined,
      updatedAt: undefined,
      ...createTaskRank({...defaultValues, id: undefined, date: values.date}, tasks, events, notes, defaultValues),
    })
    router.back();
  };

  return (
    <OverlayForm<dateSchemaType>
      id="task-date-input"
      form={form}
      onSubmit={submitHandler}
      saveStr="Confirm"
      title={mode && mode.charAt(0).toUpperCase() + mode.slice(1) + ' To'}
      backdropZindex={100}
      z={zIndex}
    >
      <div
        className="relative flex p-1 gap-3 items-center cursor-pointer"
        onClick={() => {
          datePickerRef.current?.showPicker();
        }}
      >
        <FaCalendar className="text-sm" />
        {getDateStr(form.watch('date')) || (
          <span className="text-gray-300">Select the date</span>
        )}
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
      <div className="space-y-2 my-2">
        {Object.keys(form.formState.errors).map((key) => (
          <div
            key={key}
            className="w-full p-2 text-sm bg-red-50 text-red-400 font-bold text-center rounded-lg"
          >
            {form.formState.errors[key as FieldPath<dateSchemaType>]?.message
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
    </OverlayForm>
  );
};

export default TaskDateInputOverlay;
