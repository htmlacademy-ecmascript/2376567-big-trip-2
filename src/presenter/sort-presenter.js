import SortView from '../view/sort-view.js';
import { render } from '../framework/render.js';
import { SORT_TYPES } from '../const.js';
import dayjs from 'dayjs';

export default class SortPresenter {
  container = null;
  #eventsPresenter = null;
  #boardModel = null;

  constructor({ boardContainer, eventsPresenter, boardModel }) {
    this.container = boardContainer;
    this.#eventsPresenter = eventsPresenter;
    this.#boardModel = boardModel;
  }

  init() {
    const sortView = new SortView();
    render(sortView, this.container);

    sortView.setSortInputСhangeHandler(this._handleSortTypeChange);
  }

  resetSorting() {
    const dayInput = this.container.querySelector('#sort-day');
    if (dayInput) {
      dayInput.checked = true;
    }
  }

  _handleSortTypeChange = (evt) => {
    const sortType = evt.target.dataset.sortType;

    if (this.#boardModel.getCurrentSortType() === sortType) {
      return;
    }

    this.#boardModel.changeSortType(sortType);
    const sortedEvents = this.#boardModel.getSortedEvents(this.#eventsPresenter.events, sortType);
    this.#eventsPresenter.updateEvents(sortedEvents);
  };
}
