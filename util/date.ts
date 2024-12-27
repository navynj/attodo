import dayjs from 'dayjs';

export const getDashDate = (date: Date | string | undefined | null) => {
  if (date) {
    return dayjs(date).format('YYYY-MM-DD');
  }
};

export const getDateStr = (date: Date | string | undefined | null) => {
  if (date) {
    return dayjs(date).format('YYYY. MM. DD. (ddd)');
  }
};

export const getMonthDayStr = (date: Date | string | undefined | null) => {
  if (date) {
    return dayjs(date).format('MMM D (ddd)');
  }
};

export const getDateTimeStr = (date: Date | string | undefined | null) => {
  if (date) {
    return dayjs(date).format('YYYY-MM-DDTHH:mm');
  }
};
