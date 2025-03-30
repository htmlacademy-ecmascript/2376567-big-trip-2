import EventsListView from '../view/events-list-view.js';
import NoPointView from '../view/no-point-view.js';
import { render } from '../framework/render.js';
import SortPresenter from './sort-presenter.js';
import EventsPresenter from './events-presenter.js';
import { USER_ACTIONS } from '../const.js';
import { FILTERS } from '../const.js';

export default class BoardPresenter {
  #eventsListComponent = new EventsListView();
  #boardContainer = null;
  #boardModel = null;
  #filterModel = null;
  #eventsPresenter = null;
  #addEventForm = null;

  constructor({ boardContainer, boardModel, filterModel }) {
    this.#boardContainer = boardContainer;
    this.#boardModel = boardModel;
    this.#filterModel = filterModel;

    this.#filterModel.addObserver((filter) => this._handleFilterUpdate(filter));
    this.#boardModel.addObserver(this._handleModelChange.bind(this));
  }

  init() {
    this._renderBoard();
  }

  _renderSort(eventsPresenter) {
    const sortPresenter = new SortPresenter({
      boardContainer: this.#boardContainer,
      eventsPresenter: eventsPresenter,
      boardModel: this.#boardModel,
    });

    sortPresenter.init();
  }

  _renderEvents(eventsListComponent = this.#eventsListComponent) {
    this.#eventsPresenter.init(eventsListComponent);
  }

  _handleEventChange = async (updatedEvent) => {
    try {
      await this.#boardModel.updateEvent(updatedEvent);
      this.#eventsPresenter.updateEvent(updatedEvent);
    } catch (err) {
      console.log('Ошибка при обновлении события', err);
      // throw err;
    }
  };

  _renderBoard() {
    const events = this.#boardModel.events;
    const destinations = this.#boardModel.destinations;
    const offers = this.#boardModel.offers;

    const eventsPresenterParams = {
      events,
      destinations,
      offers,
      boardModel: this.#boardModel,
      eventsListComponent: this.#eventsListComponent,
      onDataChange: this._handleEventChange,
      filterModel: this.#filterModel,
      boardContainer: this.#boardContainer,
    };

    this.#eventsPresenter = new EventsPresenter(eventsPresenterParams);
    this._renderSort(this.#eventsPresenter);

    if (events.length === 0) {
      const noPointView = new NoPointView();
      render(noPointView, this.#boardContainer);
    }

    render(this.#eventsListComponent, this.#boardContainer);
    this._renderEvents();
  }

  _handleFilterUpdate() {
    const filteredEvents = this.#filterModel.filterEvents(this.#boardModel.events);
    this.#eventsPresenter.updateEvents(filteredEvents);
  }

  updateEvents(filteredEvents) {
    this.#eventsPresenter.updateEvents(filteredEvents);
  }

  showAddEventForm(addEventView) {
    if (this.#addEventForm) {
      this.#addEventForm.removeElement();
    }
    this.#addEventForm = addEventView;
    this.#eventsPresenter.resetAllViews();
    render(this.#addEventForm, this.#eventsListComponent.element, 'afterbegin');
  }

  _handleModelChange(actionType) {
    switch (actionType) {
      case USER_ACTIONS.ADD_EVENT:
      case USER_ACTIONS.UPDATE_EVENT:
      case USER_ACTIONS.DELETE_EVENT:
        console.log('произошло обновление');
        this.updateEvents(this.#boardModel.events);
        break;
      default:
        console.log(`Необработанное событие: ${actionType}`);
    }
  }

  // _handleModelChange(actionType, payload) {
  //   console.log('Model change:', actionType, payload);

  //   switch (actionType) {
  //     case USER_ACTIONS.ADD_EVENT:
  //       this.updateEvents(this.#boardModel.events);
  //       break;
  //     case USER_ACTIONS.UPDATE_EVENT:
  //       this.#eventsPresenter.updateEvent(payload);
  //       break;
  //     case USER_ACTIONS.DELETE_EVENT:
  //       this.#eventsPresenter.deleteEvent(payload);
  //       break;
  //     default:
  //       console.log(`Необработанное событие: ${actionType}`);
  //   }
  // }

  resetAllViews() {
    this.#eventsPresenter.resetAllViews();
  }

  resetFiltersAndSorting() {
    this.#filterModel.setFilter(FILTERS[0]);
    this.#eventsPresenter.resetAllViews();
  }
}

