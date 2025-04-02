import { render } from '../framework/render.js';
import TripMainView from '../view/trip-main-veiw.js';
import FiltersPresenter from './filters-presenter.js';
import AddEventView from '../view/add-event-view.js';
import { USER_ACTIONS } from '../const.js';

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
    this.#boardPresenter = boardPresenter;
    this.#boardModel = boardModel;

    this.#filterModel.addObserver(this._handleFilterChange.bind(this));

    this.#boardModel.addObserver(this._handleSortChange.bind(this));
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

    this.#newAddEventView.setFormSubmitHandler((newEventData) => {
      this.#newAddEventView.setSaving(true);

      this.#boardModel.addEvent(newEventData)
        .then(() => {
          this._closeForm();
        })
        .catch((err) => {
          console.error('Ошибка сохранения:', err);
          this.#newAddEventView.shake();
        })
        .finally(() => {
          this.#newAddEventView.setSaving(false);
        });
    });

    this.#newAddEventView.setCancelClickHandler(() => this._closeForm());
    this.#newAddEventView.setEscKeyDownHandler(() => this._closeForm());
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
