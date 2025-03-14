import { render } from '../framework/render.js';
import FilterView from '../view/filtres-view.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export default class FiltersPresenter {
  #filterModel = null;
  #container = null;

  constructor({ filterModel }) {
    this.#filterModel = filterModel;
    this.#filterModel.addObserver(this._handleModelChange.bind(this));
  }

  init() {
    this.#container = document.body.querySelector('.trip-controls__filters');
    const filterView = new FilterView(this.#filterModel.filters);
    render(filterView, this.#container);
    filterView.setFiltersClickHandler(this._handleFilterChange.bind(this));
  }

  _handleFilterChange(filter) {
    if (this.#filterModel.filters.value === filter.value) {
      return;
    }
    this.#filterModel.setFilter(filter);
  }

  _handleModelChange(filter) {
    console.log('FiltersPresenter: Фильтр изменен:', filter);
  }
}
