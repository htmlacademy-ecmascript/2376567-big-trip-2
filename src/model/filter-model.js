import { FILTERS } from '../const.js';
import Observable from '../framework/observable.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export default class FilterModel extends Observable {
  #filters = { ...FILTERS[0] };

  constructor() {
    super();
  }

  get filters() {
    return this.#filters;
  }

  setFilter(filter) {
    this.#filters = filter;
    this._notify('FILTER_CHANGED', filter);
  }

  filterEvents(events) {
    if (!Array.isArray(events)) {
      return [];
    }

    const now = dayjs();
    const currentFilter = this.#filters.value;

    return events.filter((event) => {
      if (!event?.dateFrom || !event?.dateTo) {
        return false;
      }

      const start = dayjs(event.dateFrom);
      const end = dayjs(event.dateTo);

      switch (currentFilter) {
        case 'future':
          return start.isAfter(now, 'minute');
        case 'present':
          return now.isAfter(start, 'minute') && now.isBefore(end, 'minute');
        case 'past':
          return end.isBefore(now, 'minute');
        case 'everything':
        default:
          return true;
      }
    });
  }
}
