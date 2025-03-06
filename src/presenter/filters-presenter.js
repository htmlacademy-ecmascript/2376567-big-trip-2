import { filters } from '../const.js';
import Observable from '../framework/observable.js';
import FilterView from '../view/filtres-view.js';
import { render } from '../framework/render.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export default class FiltersPresenter extends Observable {
  #filters = { ...filters[0] };
  #container = null;

  constructor() {
    super();
  }

  init() {
    this.#container = document.body.querySelector('.trip-controls__filters');
    const filterView = new FilterView();
    render(filterView, this.#container);
    filterView.setFiltersClickHandler(this._handleFilterChange.bind(this));
  }

  get filters() {
    return this.#filters;
  }

  _handleFilterChange(filter) {
    if (this.#filters.value === filter.value) {
      return;
    }

    this.#filters = filter;
    this._notify('FILTER_CHANGED', filter);
  }

  filterEvents(events) {
    switch (this.#filters.value) {
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
