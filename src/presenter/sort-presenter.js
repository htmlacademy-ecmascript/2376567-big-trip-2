import SortView from '../view/sort-view.js';
import { render } from '../framework/render.js';
import { SortType } from '../const.js';
import dayjs from 'dayjs';

export default class SortPresenter {
  #container = null;
  #eventsPresenter = null;
  #currentSortType = SortType.DAY;

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
      case SortType.TIME:
        return [...events].sort((a, b) => dayjs(b.dateTo).diff(b.dateFrom) - dayjs(a.dateTo).diff(a.dateFrom));
      case SortType.PRICE:
        return [...events].sort((a, b) => b.basePrice - a.basePrice);
      case SortType.DAY:
      default:
        return [...events].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
    }
  }
}
