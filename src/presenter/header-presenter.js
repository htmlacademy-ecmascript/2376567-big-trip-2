import { render } from '../framework/render.js';
import TripMainView from '../view/trip-main-veiw.js';
import filtersPresenter from './filters-presenter.js';
export default class HeaderPresenter {
  constructor({ headerContainer }) {
    this.headerContainer = headerContainer;
    this.filters = new filtersPresenter();
    // this.filters.addObserver((event) => this.update(event));
  }

  init() {
    const tripMainView = new TripMainView();
    this.headerContainer.innerHTML = null;
    render(tripMainView, this.headerContainer);
    tripMainView.setFiltersClickHandler(this._onFilterChange.bind(this));
  }

  _onFilterChange(filter) {
    this.filters.setFilter(filter);
  }

  // update(event, payload) {
  //   if (event === 'FILTER_CHANGED') {
  //   }
  // }
}
