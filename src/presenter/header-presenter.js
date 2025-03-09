import { render } from '../framework/render.js';
import TripMainView from '../view/trip-main-veiw.js';

export default class HeaderPresenter {
  constructor({ headerContainer, filtersPresenter }) {
    this.headerContainer = headerContainer;
    this.filtersPresenter = filtersPresenter;
  }

  init() {
    const tripMainView = new TripMainView();
    this.headerContainer.innerHTML = null;
    render(tripMainView, this.headerContainer);
    this.filtersPresenter.init();
  }
}
