import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
dayjs.extend(durationPlugin);

const DATE_FORMAT = 'D MMM';

const humanizeTaskDueDate = (dueDate) => dueDate ? dayjs(dueDate).format(DATE_FORMAT) : '';

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const returnRandomElem = (array) => array[getRandomInt(0, array.length - 1)];
const getRandomUniqueInt = (min, max) => {
  const uinqueIntArr = [];
  return function () {
    while (uinqueIntArr.length < max - min + 1) {
      const randomInt = getRandomInt(min, max);
      if (!uinqueIntArr.includes(randomInt)) {
        uinqueIntArr.push(randomInt);
        return randomInt;
      }
    }
  };
};

const getDuration = (start, end) => {
  const duration = dayjs.duration(dayjs(end).diff(dayjs(start)));

  const totalDays = Math.floor(duration.asDays());
  const remainingHours = duration.hours();
  const remainingMinutes = duration.minutes();

  const daysStr = `${totalDays.toString().padStart(2, '0') }D`;
  const hoursStr = `${remainingHours.toString().padStart(2, '0') }H`;
  const minutesStr = `${remainingMinutes.toString().padStart(2, '0') }M`;

  return `${daysStr} ${hoursStr} ${minutesStr}`;
};

function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

const convertDateToISO = (date) => {
  if (!date) {
    return null;
  }

  if (typeof date === 'string' && date.endsWith('Z')) {
    return date;
  }

  if (typeof date === 'string') {
    const [day, month, year, hour, minute] = date.split(/[/ :]/);
    const fullYear = `20${year}`;
    const dateObj = new Date(`${fullYear}-${month}-${day}T${hour}:${minute}:00.000Z`);
    return dateObj.toISOString();
  }

  if (date instanceof Date) {
    return date.toISOString();
  }

  return null;
};

export {getRandomInt, returnRandomElem, getRandomUniqueInt, humanizeTaskDueDate, getDuration, updateItem, convertDateToISO};
