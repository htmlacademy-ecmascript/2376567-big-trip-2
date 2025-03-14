import { render } from '../framework/render.js';
import TripMainView from '../view/trip-main-veiw.js';
import FiltersPresenter from './filters-presenter.js';

export default class HeaderPresenter {
  #filterModel = null;
  #headerContainer = null;
  #filtersPresenter = null;

  constructor({ headerContainer, filterModel }) {
    this.#headerContainer = headerContainer;
    this.#filterModel = filterModel;
    this.#filtersPresenter = new FiltersPresenter({ filterModel: this.#filterModel });
    this.#filterModel.addObserver((filter) => this._handleFilterUpdate(filter));
  }

  init() {
    const tripMainView = new TripMainView();
    this.#headerContainer.innerHTML = '';
    render(tripMainView, this.#headerContainer);
    this.#filtersPresenter.init();
  }

  _handleFilterUpdate(filter) {
    console.log('HeaderPresenter: Фильтр изменен:', filter);
  }
}
