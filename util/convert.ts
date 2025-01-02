import { mainFormSchemaType } from '@/app/_overlay/MainFormOverlay';

export const convertMainFormData = (values: Partial<mainFormSchemaType>) => ({
  ...values,
  status: values.type === 'event' || values.type === 'note' ? undefined : values.status,
  goalId: values.type === 'task' ? values.goalId || null : undefined,
  date: values.type === 'goal' ? undefined : values.date ? new Date(values.date) : null,
  dueDate: values.type !== 'goal' ? undefined : values.dueDate ? new Date(values.dueDate) : undefined,
  startDate: values.type !== 'goal' ? undefined : values.startDate ? new Date(values.startDate) : undefined,
  size: values.type === 'event' || values.type === 'note' ? undefined : values.size,
  weight: values.type === 'event' || values.type === 'note' ? undefined : values.weight,
});
