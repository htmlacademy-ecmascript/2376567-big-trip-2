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
    const currentFilter = this.#filters;

    switch (currentFilter.value) {
      case 'everything':
        return events;
      case 'future':
        return events.filter((event) => dayjs(event.dateFrom).isAfter(dayjs()));
      case 'present':
        return events.filter((event) => dayjs().isBetween(dayjs(event.dateFrom), dayjs(event.dateTo)));
      case 'past':
        return events.filter((event) => dayjs(event.dateFrom).isBefore(dayjs()));
      default:
        return events;
    }
  }
}
