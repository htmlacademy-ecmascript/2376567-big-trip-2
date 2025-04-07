import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(durationPlugin);
dayjs.extend(advancedFormat);
dayjs.extend(isBetween);

const getDuration = (start, end) => {
  const duration = dayjs.duration(dayjs(end).diff(dayjs(start)));

  const totalDays = Math.floor(duration.asDays());
  const remainingHours = duration.hours();
  const remainingMinutes = duration.minutes();

  const daysStr = `${totalDays.toString().padStart(2, '0')}D`;
  const hoursStr = `${remainingHours.toString().padStart(2, '0')}H`;
  const minutesStr = `${remainingMinutes.toString().padStart(2, '0')}M`;

  return `${daysStr} ${hoursStr} ${minutesStr}`;
};

const convertDateToISO = (date) => {
  if (!date) {
    return null;
  }

  if (typeof date === 'string' && date.endsWith('Z')) {
    return date;
  }

  if (typeof date === 'string') {
    const [day, month, year, hour, minute] = date.split(/[/ :]/);
    const fullYear = year.length === 2 ? `20${year}` : year;

    const dateObj = new Date(`${fullYear}-${month}-${day}T${hour}:${minute}:00`);

    const isoString = dateObj.toISOString();
    return isoString;
  }

  if (date instanceof Date) {
    return date.toISOString();
  }

  return null;
};

const formatDatesRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return '';
  }
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (start.isSame(end, 'day')) {
    return start.format('D MMM');
  }
  if (start.isSame(end, 'month')) {
    return `${start.format('D')} — ${end.format('D MMM')}`;
  }
  return `${start.format('D MMM')} — ${end.format('D MMM')}`;
};

export {
  getDuration,
  convertDateToISO,
  formatDatesRange,
};
