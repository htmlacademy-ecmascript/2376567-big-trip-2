import AbstractView from '../framework/view/abstract-view.js';

function createTripMainTemplate() {
  return (
    `<div class="page-body__container  page-header__container">
        <img class="page-header__logo" src="img/logo.png" width="42" height="42" alt="Trip logo">
        <div class="trip-main">
          <section class="trip-main__trip-info  trip-info">
            <div class="trip-info__main">
              <h1 class="trip-info__title">Amsterdam — Chamonix — Geneva</h1>
              <p class="trip-info__dates">18&nbsp;—&nbsp;20 Mar</p>
            </div>
            <p class="trip-info__cost">
              Total: €&nbsp;<span class="trip-info__cost-value">1230</span>
            </p>
          </section>
          <div class="trip-main__trip-controls  trip-controls">
            <div class="trip-controls__filters">
              <h2 class="visually-hidden">Filter events</h2>

              <!-- Фильтры -->

            </div>
          </div>
          <button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">New event</button>
        </div>
      </div>`
  );
}
export default class TripMainView extends AbstractView {
  get template() {
    return createTripMainTemplate();
  }
}
