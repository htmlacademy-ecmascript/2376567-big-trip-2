import { render } from '../framework/render.js';
import FilterView from '../view/filters-view.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export default class FiltersPresenter {
  #filterModel = null;
  #container = null;
  #filterView = null;

  constructor({ filterModel }) {
    this.#filterModel = filterModel;
    this.#filterModel.addObserver(this._handleModelReset.bind(this));
    // this.#filterModel.addObserver(this._handleModelChange.bind(this));
  }

  init() {
    this.#container = document.body.querySelector('.trip-controls__filters');
    this.#filterView = new FilterView(this.#filterModel.filters);
    render(this.#filterView, this.#container);
    this.#filterView.setFiltersClickHandler(this._handleFilterChange.bind(this));
  }

  _handleModelReset(event, payload) {
    if (event === 'FILTER_RESET') {
      this.#filterView.updateSelectedFilter(payload.value);
    }
  }

  _handleFilterChange(filter) {
    if (this.#filterModel.filters.value === filter.value) {
      return;
    }
    this.#filterModel.setFilter(filter);

    this.#filterModel._notify('FILTER_CHANGED', filter);
  }

  // _handleModelChange(filter) {
  //   console.log('FiltersPresenter: Фильтр изменен:', filter);
  // }
}
