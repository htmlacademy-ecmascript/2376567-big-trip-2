import SortView from '../view/sort-view.js';
import { render } from '../framework/render.js';
import { SORT_TYPES } from '../const.js';
import dayjs from 'dayjs';

export default class SortPresenter {
  #container = null;
  #eventsPresenter = null;
  #currentSortType = SORT_TYPES.DAY;

  constructor({ boardContainer, eventsPresenter }) {
    this.#container = boardContainer;
    this.#eventsPresenter = eventsPresenter;
  }

  init() {
    const sortView = new SortView();
    render(sortView, this.#container);

    sortView.setSortInputClickHandler(this._handleSortTypeChange);
  }

  _handleSortTypeChange = (evt) => {
    const sortType = evt.target.dataset.sortType;

    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    const sortedEvents = this._getSortedEvents(this.#eventsPresenter.events, sortType);
    this.#eventsPresenter.updateEvents(sortedEvents);
  };

  _getSortedEvents(events, sortType) {
    switch (sortType) {
      case SORT_TYPES.TIME:
        return [...events].sort((a, b) => dayjs(b.dateTo).diff(b.dateFrom) - dayjs(a.dateTo).diff(a.dateFrom));
      case SORT_TYPES.PRICE:
        return [...events].sort((a, b) => b.basePrice - a.basePrice);
      case SORT_TYPES.DAY:
      default:
        return [...events].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
    }
  }
}
