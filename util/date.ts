import dayjs from 'dayjs';

export const getDashDate = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const getDateStr = (date: Date) => {
  return dayjs(date).format('MMM D (ddd)');
};

export const getDateTimeStr = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
};
