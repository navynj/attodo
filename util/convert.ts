import { mainFormSchemaType } from '@/app/_components/MainFormOverlay';

export const convertMainFormData = (values: Partial<mainFormSchemaType>) => ({
  ...values,
  status: values.type === 'event' || values.type === 'note' ? undefined : values.status,
  goalId: values.type === 'task' ? values.goalId || null : undefined,
  date: values.date ? new Date(values.date) : undefined,
  dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
  startDate: values.startDate ? new Date(values.startDate) : undefined,
});
