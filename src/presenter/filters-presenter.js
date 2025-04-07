import { render } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export default class FiltersPresenter {
  #filterModel = null;
  #boardModel = null;
  #container = null;
  #FiltersView = null;

  constructor({ filterModel, boardModel }) {
    this.#filterModel = filterModel;
    this.#boardModel = boardModel;
    this.#filterModel.addObserver(this._handleModelReset.bind(this));
    this.#boardModel.addObserver(this._handlePointsChange.bind(this));
  }

  init() {
    this.#container = document.body.querySelector('.trip-controls__filters');
    this.#FiltersView = new FiltersView();
    render(this.#FiltersView, this.#container);
    this.#FiltersView.setFiltersClickHandler(this._handleFilterChange.bind(this));

    this._updateFiltersAvailability();
  }

  _handleModelReset(event, payload) {
    if (event === 'FILTER_RESET') {
      this.#FiltersView.updateSelectedFilter(payload.value);
    }
  }

  _handlePointsChange() {
    this._updateFiltersAvailability();
  }

  _handleFilterChange(filter) {
    if (this.#filterModel.filters.value === filter.value) {
      return;
    }
    this.#filterModel.setFilter(filter);
    this.#filterModel._notify('FILTER_CHANGED', filter);
  }

  _updateFiltersAvailability() {
    const events = this.#boardModel.events;
    const currentDate = dayjs();

    const disabledFilters = {
      everything: events.length === 0,
      future: !events.some((event) => dayjs(event.dateFrom).isAfter(currentDate)),
      present: !events.some((event) =>
        currentDate.isBetween(dayjs(event.dateFrom), dayjs(event.dateTo), null, '[]')
      ),
      past: !events.some((event) => dayjs(event.dateTo).isBefore(currentDate))
    };

    this.#FiltersView.updateDisabledFilters(disabledFilters);

    if (disabledFilters[this.#filterModel.filters.value] && events.length > 0) {
      const everythingFilter = this.#filterModel.filters.find((f) => f.value === 'everything');
      this.#filterModel.setFilter(everythingFilter);
      this.#FiltersView.updateSelectedFilter('everything');
    }
  }
}
