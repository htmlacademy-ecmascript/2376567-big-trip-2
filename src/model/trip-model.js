import { filters } from '../const.js';

export default class TripMainModel {
  #filters = { ...filters[0] };
  #observers = [];

  constructor() {}

  get filters() {
    return this.#filters;
  }

  setFilter(filter) {
    this.#filters = filter;
    this.notifyObservers();
  }

  addObserver(observer) {
    this.#observers.push(observer);
  }

  removeObserver(observer) {
    this.#observers = this.#observers.filter((obs) => obs !== observer);
  }

  notifyObservers() {
    this.#observers.forEach((observer) => observer.update(this.#filters));
  }
}
