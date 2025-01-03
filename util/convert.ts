import { mainFormSchemaType } from '@/app/_overlay/MainFormOverlay';
import { EventType } from '@/store/event';
import { NoteType } from '@/store/note';
import { TaskType } from '@/store/task';
import { LexoRank } from 'lexorank';
import { getDashDate } from './date';

export const convertMainFormData = (
  values: Partial<mainFormSchemaType> & { createdAt?: string; updatedAt?: string }
) => ({
  ...values,
  status: values.type === 'event' || values.type === 'note' ? undefined : values.status,
  goalId: values.type === 'task' ? values.goalId || null : undefined,
  date: values.type === 'goal' ? undefined : values.date ? new Date(values.date) : null,
  dueDate:
    values.type !== 'goal'
      ? undefined
      : values.dueDate
      ? new Date(values.dueDate)
      : undefined,
  startDate:
    values.type !== 'goal'
      ? undefined
      : values.startDate
      ? new Date(values.startDate)
      : undefined,
  size: values.type === 'event' || values.type === 'note' ? undefined : values.size,
  weight: values.type === 'event' || values.type === 'note' ? undefined : values.weight,
  listRank: values.listRank?.toString(),
  matrixRank: values.matrixRank?.toString(),
  goalRank: values.goalRank?.toString(),
  goal: undefined,
});

export const convertRank = (values: any) => ({
  ...values,
  listRank: values.listRank ? LexoRank.parse(values.listRank) : undefined,
  matrixRank: values.matrixRank ? LexoRank.parse(values.matrixRank) : undefined,
  goalRank: values.goalRank ? LexoRank.parse(values.goalRank) : undefined,
});

export const getSortedList = (
  tasks?: TaskType[],
  events?: EventType[],
  notes?: NoteType[],
  date?: string | null
) =>
  [
    ...(tasks?.filter((item) => getDashDate(item.date) === getDashDate(date)) || []),
    ...(events?.filter((item) => getDashDate(item.date) === getDashDate(date)) || []),
    ...(notes?.filter((item) => getDashDate(item.date) === getDashDate(date)) || []),
  ]?.sort((a, b) => (b.listRank ? a.listRank?.compareTo(b.listRank) || 0 : 0));

export const createTaskRank = (
  values: any,
  tasks?: TaskType[],
  events?: EventType[],
  notes?: NoteType[],
  defaultValues?: any
) => {
  const sortedList = getSortedList(tasks, events, notes, values.date);
  const sortedMatrix = tasks
    ?.filter(
      (item) =>
        item.matrixRank &&
        !!item.isImportant === !!values.isImportant &&
        !!item.isUrgent === !!values.isUrgent
    )
    .sort((a, b) => (b.matrixRank ? a.matrixRank?.compareTo(b.matrixRank) || 0 : 0));

  const sortedGoalList = tasks
    ?.filter((item) => item.goalId === values.goalId)
    .sort((a, b) => (b.matrixRank ? a.matrixRank?.compareTo(b.matrixRank) || 0 : 0));

  return {
    listRank:
      values.id && getDashDate(values.date) === getDashDate(defaultValues.date)
        ? values.listRank
        : !values.date
        ? undefined
        : sortedList && sortedList[sortedList.length - 1]
        ? sortedList[sortedList.length - 1]?.listRank?.genNext() || LexoRank.middle()
        : LexoRank.middle(),
    matrixRank:
      values.id &&
      defaultValues &&
      !!defaultValues.isImportant === !!values.isImportant &&
      !!defaultValues.isUrgent === !!values.isUrgent
        ? values.matrixRank
        : 
        sortedMatrix && sortedMatrix[sortedMatrix.length - 1]
        ? sortedMatrix[sortedMatrix.length - 1]?.matrixRank?.genNext() ||
          LexoRank.middle()
        : LexoRank.middle(),
    goalRank:
      values.id && values.goalId === defaultValues.goalId
        ? values.goalRank
        : !values.goalId
        ? undefined
        : sortedGoalList && sortedGoalList[sortedGoalList.length - 1]
        ? sortedGoalList[sortedGoalList.length - 1]?.goalRank?.genNext() ||
          LexoRank.middle()
        : LexoRank.middle(),
  };
};
