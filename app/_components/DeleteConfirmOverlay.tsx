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
import { FaCircleExclamation } from 'react-icons/fa6';
import * as z from 'zod';
const formSchema = z.object({});

type schemaType = z.infer<typeof formSchema>;

const TaskDateInputOverlay = () => {
  const router = useRouter();

  const defaultValues = useAtomValue(mainFormDataAtom);
  const { refetch } = useAtomValue(tasksAtom);

  const form = useForm<schemaType>({
    resolver: zodResolver(formSchema),
  });

  const submitHandler = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/task/${defaultValues?.id}`, {
        method: 'DELETE',
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
    <OverlayForm<schemaType>
      id="delete-confirm"
      form={form}
      onSubmit={submitHandler}
      saveStr="Delete"
      backdropZindex={100}
      className="flex flex-col items-center text-center py-6"
    >
        <FaCircleExclamation className="text-3xl" />
        <h3 className="text-2xl font-extrabold mb-3">Are you sure?</h3>
        <p className='leading-tight'>
        Are you sure you want to delete this? <br/>
        This process cannot be undone.
        </p>
    </OverlayForm>
  );
};

export default TaskDateInputOverlay;
