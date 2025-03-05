import { filters } from '../const.js';
import Observable from '../framework/observable.js';
export default class TripMainModel extends Observable {
  #filters = { ...filters[0] };

  constructor() {
    super();
  }

  get filters() {
    return this.#filters;
  }

  setFilter(filter) {
    this.#filters = filter;
    this._notify('FILTER_CHANGED', filter);
  }
}
