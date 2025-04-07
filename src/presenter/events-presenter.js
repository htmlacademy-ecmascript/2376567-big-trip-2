import EventPresenter from './event-presenter.js';
import NoEventsView from '../view/no-events-view.js';
import { render } from '../framework/render.js';
import { USER_ACTIONS } from '../const.js';
import { NO_EVENTS_MESSAGES } from '../const.js';

export default class EventsPresenter {
  events = [];
  #destinations = [];
  #offers = [];
  #boardModel = null;
  #eventsListComponent = null;
  #onDataChange = null;
  #eventPresenters = new Map();
  #filterModel = null;
  #resetFiltersAndSorting = null;
  #onFormOpen = null;
  #tripMainView = null;
  #uiBlocker = null;

  constructor({ events, destinations, offers, boardModel, eventsListComponent, onDataChange, filterModel, resetFiltersAndSorting, onFormOpen, tripMainView, uiBlocker}) {
    this.events = events;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#boardModel = boardModel;
    this.#eventsListComponent = eventsListComponent;
    this.#onDataChange = onDataChange;
    this.#filterModel = filterModel;
    this.#resetFiltersAndSorting = resetFiltersAndSorting;
    this.#onFormOpen = onFormOpen;
    this.#tripMainView = tripMainView;
    this.#uiBlocker = uiBlocker;
  }

  init() {
    this._renderEvents();
  }

  _renderEvent(event) {
    const liElement = document.createElement('li');
    liElement.classList.add('trip-events__item');

    const destination = this.#boardModel.getDestinationsById(event.destination);
    const offer = this.#boardModel.getOffersByType(event.type);

    const eventPresenter = new EventPresenter({
      event,
      destination,
      offer,
      onDataChange: this.#onDataChange,
      destinationAll: this.#destinations,
      offerAll: this.#offers,
      onFormOpen: () => {
        this.#tripMainView.unblockNewEventButton();
        this.#onFormOpen?.();
        this.resetAllViews();
      },
      onUserAction: this.handleUserAction.bind(this),
      onDelete: async (eventId) => {
        await this.handleDeleteEvent(eventId);
      },
      resetFiltersAndSorting: this.#resetFiltersAndSorting,
      boardModel: this.#boardModel,
      uiBlocker: this.#uiBlocker,
    });

    eventPresenter.init(liElement);
    this.#eventsListComponent.element.appendChild(liElement);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  async handleDeleteEvent(eventId) {
    try {
      this.#uiBlocker.block();
      await this.#boardModel.deleteEvent(eventId);
      this.#eventsListComponent.element.innerHTML = '';
      this.events = this.#boardModel.events;
      this._renderEvents();
    } finally {
      this.#uiBlocker.unblock();
    }
  }

  _renderEvents() {
    this.removeNoEventsView();

    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();
    this.removeNoEventsView();

    const message = this._getNoEventsMessage();

    const filteredEvents = this.#filterModel.filterEvents(this.#boardModel.events);
    const currentSortType = this.#boardModel.getCurrentSortType();
    const sortedEvents = this.#boardModel.getSortedEvents(filteredEvents, currentSortType);

    if (filteredEvents.length === 0) {
      const noEventsView = new NoEventsView(message);
      render(noEventsView, this.#eventsListComponent.element);
      return;
    }

    this.#eventsListComponent.element.innerHTML = '';

    sortedEvents.forEach((event) => this._renderEvent(event));
  }

  _getNoEventsMessage() {
    switch (this.#filterModel.filters.value) {
      case 'past':
        return NO_EVENTS_MESSAGES.past;
      case 'present':
        return NO_EVENTS_MESSAGES.present;
      case 'future':
        return NO_EVENTS_MESSAGES.future;
      case 'everything':
      default:
        return NO_EVENTS_MESSAGES.everything;
    }
  }

  removeNoEventsView() {
    const noEventsElement = this.#eventsListComponent.element.querySelector('.trip-events__msg');
    if (noEventsElement) {
      noEventsElement.remove();
    }
  }

  handleUserAction(actionType, payload) {
    switch (actionType) {
      case USER_ACTIONS.ADD_EVENT:
        break;
      case USER_ACTIONS.UPDATE_EVENT:
        this.#boardModel.updateEvent(payload)
          .then(() => this._renderEvents())
          .catch(() => this._renderEvents());
        break;
      case USER_ACTIONS.DELETE_EVENT:
        return this.#boardModel.deleteEvent(payload)
          .then(() => this._renderEvents());
    }
  }

  updateEvent(updatedEvent) {
    const eventPresenter = this.#eventPresenters.get(updatedEvent.id);
    if (eventPresenter) {
      const destination = this.#boardModel.getDestinationsById(updatedEvent.destination);
      const offer = this.#boardModel.getOffersByType(updatedEvent.type);
      eventPresenter.update(updatedEvent, destination, offer);
    }
  }

  updateEvents(filteredEvents) {
    this.events = filteredEvents;
    this._renderEvents();
  }

  resetAllViews() {
    this.removeNoEventsView();
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
    this.#tripMainView.unblockNewEventButton();
  }
}
