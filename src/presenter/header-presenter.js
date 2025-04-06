import { render } from '../framework/render.js';
import TripMainView from '../view/trip-main-veiw.js';
import FiltersPresenter from './filters-presenter.js';
import AddEventView from '../view/add-event-view.js';
import { USER_ACTIONS } from '../const.js';
import TripInfoPresenter from './trip-info-presenter.js';

export default class HeaderPresenter {
  #filterModel = null;
  #headerContainer = null;
  #filtersPresenter = null;
  #tripMainView = null;
  #boardPresenter = null;
  #newAddEventView = null;
  #isFormOpen = false;
  #boardModel = null;
  #uiBlocker = null;
  #tripInfoPresenter = null;

  constructor({ headerContainer, filterModel, boardPresenter, boardModel, uiBlocker }) {
    this.#headerContainer = headerContainer;
    this.#filterModel = filterModel;
    this.#boardModel = boardModel;
    this.#boardPresenter = boardPresenter;
    this.#uiBlocker = uiBlocker;

    this.#tripInfoPresenter = new TripInfoPresenter({
      container: headerContainer,
      boardModel: this.#boardModel,
      uiBlocker: this.#uiBlocker,
      boardPresenter: boardPresenter,
    });

    this.#filtersPresenter = new FiltersPresenter({
      filterModel: this.#filterModel,
      boardModel: this.#boardModel
    });

    this.#filterModel.addObserver(this._handleFilterChange.bind(this));
    this.#boardModel.addObserver(this._handleSortChange.bind(this));
  }

  async init() {
    try {
      this.#uiBlocker.block();

      this.#tripMainView = new TripMainView();
      this.#boardPresenter.setTripMainView(this.#tripMainView);

      this.#headerContainer.innerHTML = '';
      render(this.#tripMainView, this.#headerContainer);

      await this.#tripInfoPresenter.init();

      this.#filtersPresenter.init();

      this.#tripMainView.setNewEventButtonHandler(() => this._handleNewEventClick());

    } finally {
      this.#uiBlocker.unblock();
    }
  }

  _handleNewEventClick() {
    if (this.#isFormOpen) {
      return;
    }

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
      offer: this.#boardModel.offers.find((o) => o.type === newEvent.type) || null,
      destinations: this.#boardModel.destinations || [],
      offers: this.#boardModel.offers || [],
    });

    this.#newAddEventView.setFormSubmitHandler(async (newEventData) => {
      const formView = this.#newAddEventView;

      try {
        this.#uiBlocker.block();
        this.#newAddEventView.setSaving(true);
        await this.#boardModel.addEvent(newEventData);
        this._closeForm();
      } catch (err) {
        this.#newAddEventView.shake();
      } finally {
        if (this.#newAddEventView === formView) {
          formView.setSaving(false);
        }
        this.#uiBlocker.unblock();
      }
    });

    this.#newAddEventView.setCancelClickHandler(() => this._closeForm());
    this.#newAddEventView.setEscKeyDownHandler(() => this._closeForm());
    this.#boardPresenter.showAddEventForm(this.#newAddEventView);
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

  _handleFilterChange() {
    if (this.#isFormOpen) {
      this._closeForm();
    }
  }

  _handleSortChange(event) {
    if (event === USER_ACTIONS.SORT_CHANGED && this.#isFormOpen) {
      this._closeForm();
    }
  }
}
