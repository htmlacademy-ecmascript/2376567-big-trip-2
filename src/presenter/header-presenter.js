import { render } from '../framework/render.js';
import TripMainView from '../view/trip-main-veiw.js';
export default class HeaderPresenter {
  constructor({ headerContainer, tripModel }) {
    this.headerContainer = headerContainer;
    this.tripModel = tripModel;
    // this.tripModel.addObserver((event) => this.update(event));
  }

  init() {
    const tripMainView = new TripMainView();
    this.headerContainer.innerHTML = null;
    render(tripMainView, this.headerContainer);
    tripMainView.setFiltersClickHandler(this._onFilterChange.bind(this));
  }

  _onFilterChange(filter) {
    this.tripModel.setFilter(filter);
  }

  // update(event, payload) {
  //   if (event === 'FILTER_CHANGED') {
  //   }
  // }
}
