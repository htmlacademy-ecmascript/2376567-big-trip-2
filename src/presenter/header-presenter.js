import { render } from '../framework/render.js';
import TripMainView from '../view/trip-main-veiw.js';

export default class HeaderPresenter {
  constructor({ headerContainer, tripModel }) {
    this.headerContainer = headerContainer;
    this.tripModel = tripModel;
  }

  init() {
    const tripMainView = new TripMainView();
    this.headerContainer.innerHTML = null;
    render(tripMainView, this.headerContainer);
    tripMainView.setFiltersClickHandler(this._onFilterChange.bind(this));
    this.tripModel.addObserver(this);
  }

  _onFilterChange(filter) {
    this.tripModel.setFilter(filter);
  }

  update(filter) {
    console.log('Header updated with filter:', filter);
  }
}

