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
  if (duration.days()) {
    return duration.format('DD[d] HH[h] mm[m]');
  }
  if (duration.hours()) {
    return duration.format('HH[h] mm[m]');
  }
};

function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

export {getRandomInt, returnRandomElem, getRandomUniqueInt, humanizeTaskDueDate, getDuration, updateItem};
