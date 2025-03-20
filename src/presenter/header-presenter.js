import { render } from '../framework/render.js';
import TripMainView from '../view/trip-main-veiw.js';
import FiltersPresenter from './filters-presenter.js';
import AddEventView from '../view/add-event-view.js';

export default class HeaderPresenter {
  #filterModel = null;
  #headerContainer = null;
  #filtersPresenter = null;
  #tripMainView = null;
  #boardPresenter = null;
  #newAddEventView = null;
  #isFormOpen = false;
  #boardModel = null;

  constructor({ headerContainer, filterModel, boardPresenter, boardModel }) {
    this.#headerContainer = headerContainer;
    this.#filterModel = filterModel;
    this.#filtersPresenter = new FiltersPresenter({ filterModel: this.#filterModel });
    // this.#filterModel.addObserver((filter) => this._handleFilterUpdate(filter));
    this.#boardPresenter = boardPresenter;
    this.#boardModel = boardModel;
  }

  init() {
    this.#tripMainView = new TripMainView();
    this.#headerContainer.innerHTML = '';
    render(this.#tripMainView, this.#headerContainer);
    this.#tripMainView.setNewEventButtonHandler(() => this._handleNewEventClick());
    this.#filtersPresenter.init();
  }

  _handleNewEventClick() {
    if (this.#isFormOpen) {
      return;
    }

    const destinations = this.#boardModel.destinations;
    const offers = this.#boardModel.offers;

    this.#boardPresenter.resetAllViews();
    this.#boardPresenter.resetFiltersAndSorting();

    const newEvent = {
      id: null,
      type: 'flight',
      dateFrom: new Date(),
      dateTo: new Date(),
      basePrice: 0,
      offersId: [],
      destination: 8,
    };

    this.#newAddEventView = new AddEventView({
      event: newEvent,
      destination: null,
      offer: offers.find((offer) => offer.type === newEvent.type) || null,
      destinations: destinations || [],
      offers: offers || [],
    });

    this.#newAddEventView.setFormSubmitHandler((newEvn) => this._handleFormSubmit(newEvn));
    this.#newAddEventView.setCancelClickHandler(() => this._closeForm());

    this.#boardPresenter.showAddEventForm(this.#newAddEventView);
    this.#isFormOpen = true;

    this.#tripMainView.blockNewEventButton();
  }

  _handleFormSubmit(newEvent) {
    this.#boardModel.addEvent(newEvent);
    this._closeForm();

    const updatedEvents = this.#boardModel.events;
    this.#boardPresenter.updateEvents(updatedEvents);
  }

  _closeForm() {
    if (!this.#newAddEventView) {
      return;
    }
    this.#newAddEventView.removeElement();
    this.#newAddEventView = null;
    this.#isFormOpen = false;

    this.#tripMainView.unblockNewEventButton();
    this.#boardPresenter.updateEvents(this.#boardModel.events);
  }

  // _handleFilterUpdate(filter) {
  //   console.log('HeaderPresenter: Фильтр изменен:', filter);
  // }
}
