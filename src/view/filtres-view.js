import AbstractView from '../framework/view/abstract-view';
import { filters } from '../const';

function createFilterTemplate() {
  const addFilters = (arrayfilters) => arrayfilters.map(({ id, value, name, status }) =>
    `<div class="trip-filters__filter">
      <input id="${id}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${value}" ${status}>
      <label class="trip-filters__filter-label" for="${id}">${name}</label>
    </div>`).join('');

  return (
    `<form class="trip-filters" action="#" method="get">
    ${ addFilters(filters) }
      <button class="visually-hidden" type="submit">Accept filter</button>
      </form>`
  );
}

export default class FilterView extends AbstractView {

  constructor() {
    super();
  }

  get template() {
    return createFilterTemplate(filters);
  }

  setFiltersClickHandler(handler) {
    this._callback.filtersClick = handler;
    this.element.querySelectorAll('.trip-filters__filter-label').forEach((label) => {
      label.addEventListener('click', () => {
        const input = label.parentElement.querySelector('.trip-filters__filter-input');
        const filter = filters.find((item) => item.value === input.value);
        this._callback.filtersClick(filter);
      });
    });
  }

}
