import { render } from '../framework/render.js';
import TripMainVeiw from '../view/trip-main-veiw.js';

export default class HeaderPresenter {
  constructor({ headerContainer }) {
    this.headerContainer = headerContainer;
  }

  init() {
    const tripMainVeiw = new TripMainVeiw();
    this.headerContainer.innerHTML = null;
    render(tripMainVeiw, this.headerContainer);
    tripMainVeiw.setFiltersClickHandler(() => console.log('!!!'));
  }
}
