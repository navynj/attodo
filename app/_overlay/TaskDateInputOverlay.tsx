'use client';

import OverlayForm from '@/components/overlay/OverlayForm';
import { tasksAtom } from '@/store/task';
import { mainFormDataAtom } from '@/store/ui';
import { getDateStr } from '@/util/date';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtomValue } from 'jotai';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { FieldPath, useForm } from 'react-hook-form';
import { FaCalendar } from 'react-icons/fa';
import * as z from 'zod';
const formSchema = z.object({
  date: z.string().nonempty(),
});

type dateSchemaType = z.infer<typeof formSchema>;

const TaskDateInputOverlay = () => {
  const router = useRouter();

  const params = useSearchParams();
  const mode = params.get('mode');

  const defaultValues = useAtomValue(mainFormDataAtom);
  const { refetch } = useAtomValue(tasksAtom);

  const form = useForm<dateSchemaType>({
    resolver: zodResolver(formSchema),
  });

  const datePickerRef = useRef<HTMLInputElement | null>(null);

  const submitHandler = async (values: dateSchemaType) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/task`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          ...defaultValues,
          id: undefined,
          date: new Date(values.date),
        }),
      });

      if (!response.ok) {
        throw new Error(response.status + ' ' + response.statusText);
      }

      router.back();
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <OverlayForm<dateSchemaType>
      id="task-date-input"
      form={form}
      onSubmit={submitHandler}
      saveStr="Confirm"
      title={mode && mode.charAt(0).toUpperCase() + mode.slice(1) + ' To'}
      backdropZindex={100}
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
