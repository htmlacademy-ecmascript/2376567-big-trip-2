import AbstractView from '../framework/view/abstract-view.js';
import { SORT_BUTTONS } from '../const.js';

function createSortTemplate() {
  const createSortButtonTemplate = (buttons) => buttons.map(({ name, status }) =>
    `<div class="trip-sort__item trip-sort__item--${name}">
        <input id="sort-${name}" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" data-sort-type="${name}" value="sort-${name}" ${status}>
        <label class="trip-sort__btn" for="sort-${name}">${name}</label>
      </div>`
  ).join('');

  return (
    `<form class="trip-events__trip-sort trip-sort" action="#" method="get">
      ${createSortButtonTemplate(SORT_BUTTONS)}
    </form>`
  );
}

export default class SortView extends AbstractView {

  constructor() {
    super();
    this._sortInputСhangeHandler = this._sortInputСhangeHandler.bind(this);
  }

  get template() {
    return createSortTemplate();
  }

  _sortInputСhangeHandler(evt) {
    this._callback.sortInputСhange(evt);
  }

  setSortInputСhangeHandler(callback) {
    this._callback.sortInputСhange = callback;
    document.querySelector('.trip-sort').addEventListener('change', this._sortInputСhangeHandler);
  }

}
