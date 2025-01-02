'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import Overlay from './Overlay';
import { OverlayProps } from './OverlayContent';
import SaveCancelButton from './SaveCancelButton';
interface OverlayFormProps<T extends FieldValues> extends OverlayProps {
  form: UseFormReturn<T, any, undefined>;
  onSubmit: (values: T) => Promise<void>;
  disableReset?: boolean;
  disalbeBackOnSubmit?: boolean;
  hideButtons?: boolean;
  saveStr?: string;
  isPending?: boolean;
}

const OverlayForm = <T extends FieldValues>({
  children,
  form,
  onSubmit,
  onClose,
  disableReset,
  disalbeBackOnSubmit,
  hideButtons,
  saveStr,
  className,
  isPending,
  ...props
}: PropsWithChildren<OverlayFormProps<T>>) => {
  const router = useRouter();

  const submitHandler = async (values: T) => {
    try {
      await onSubmit(values);
      !disalbeBackOnSubmit && closeHandler();
      !disalbeBackOnSubmit && router.back();
    } catch (error) {
      console.error(error);
    }
  };

  const closeHandler = () => {
    onClose && onClose();
    !disableReset && form.reset();
  };

  const cancleHandler = () => {
    closeHandler();
    router.back();
  };

  return (
    <Overlay
      hideX={true}
      {...props}
      onClose={closeHandler}
      disableBackdrop={form.formState.isSubmitting || isPending}
    >
      <form onSubmit={form.handleSubmit(submitHandler)} className="w-full">
        <div className={className}>{children}</div>
        {!hideButtons && (
          <SaveCancelButton
            onCancel={cancleHandler}
            isPending={form.formState.isSubmitting || isPending}
            saveStr={saveStr}
          />
        )}
      </form>
    </Overlay>
  );
};

export default OverlayForm;
