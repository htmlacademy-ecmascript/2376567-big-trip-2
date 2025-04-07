import AbstractView from '../framework/view/abstract-view';
import { FILTERS } from '../const';

function createFilterTemplate(disabledFilters = {}) {
  const addFilters = (renderFilterItems) => renderFilterItems.map(({ id, value, name, status }) =>
    `<div class="trip-filters__filter">
      <input id="${id}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${value}" ${status} ${disabledFilters[value] ? 'disabled' : ''}>
      <label class="trip-filters__filter-label" for="${id}">${name}</label>
    </div>`).join('');

  return (
    `<form class="trip-filters" action="#" method="get">
    ${ addFilters(FILTERS) }
      <button class="visually-hidden" type="submit">Accept filter</button>
      </form>`
  );
}

export default class FiltersView extends AbstractView {
  #disabledFilters = {};

  constructor() {
    super();
  }

  updateSelectedFilter(filterValue) {
    const inputs = this.element.querySelectorAll('.trip-filters__filter-input');
    inputs.forEach((input) => {
      if (!input.disabled) {
        input.checked = (input.value === filterValue);
      }
    });
  }

  updateDisabledFilters(disabledFilters) {
    this.#disabledFilters = disabledFilters;
    const inputs = this.element.querySelectorAll('.trip-filters__filter-input');
    inputs.forEach((input) => {
      input.disabled = this.#disabledFilters[input.value] || false;
    });
  }

  get template() {
    return createFilterTemplate(this.#disabledFilters);
  }

  setFiltersClickHandler(handler) {
    this._callback.filtersClick = handler;
    this.element.querySelectorAll('.trip-filters__filter-label').forEach((label) => {
      label.addEventListener('click', () => {
        const input = label.parentElement.querySelector('.trip-filters__filter-input');
        if (!input.disabled) {
          const filter = FILTERS.find((item) => item.value === input.value);
          this._callback.filtersClick(filter);
        }
      });
    });
  }
}
