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
  #boardContainer = null;

  constructor({ events, destinations, offers, boardModel, eventsListComponent, onDataChange, filterModel, boardContainer }) {
    this.events = events;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#boardModel = boardModel;
    this.#eventsListComponent = eventsListComponent;
    this.#onDataChange = onDataChange;
    this.#filterModel = filterModel;
    this.#boardContainer = boardContainer;
  }

  init() {
    this._renderEvents();
  }

  _renderEvent(event) {
    const destination = this.#boardModel.getDestinationsById(event.destination);
    const offer = this.#boardModel.getOffersByType(event.type);

    const eventPresenter = new EventPresenter({
      event,
      destination,
      offer,
      onDataChange: this.#onDataChange,
      destinationAll: this.#destinations,
      offerAll: this.#offers,
      onFormOpen: this.resetAllViews.bind(this),
      onUserAction: this.handleUserAction.bind(this),
      onDelete: async (eventId) => {
        await this.handleDeleteEvent(eventId);
      }
    });

    eventPresenter.init(this.#eventsListComponent.element);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  async handleDeleteEvent(eventId) {
    this.#eventsListComponent.element.innerHTML = '';
    this._renderEvents();

  }

  _renderEvents() {
    this.removeNoEventsView();
    let message = '';
    switch (this.#filterModel.filters.value) {
      case 'everything':
        message = NO_EVENTS_MESSAGES.everything;
        break;
      case 'past':
        message = NO_EVENTS_MESSAGES.past;
        break;
      case 'present':
        message = NO_EVENTS_MESSAGES.present;
        break;
      case 'future':
        message = NO_EVENTS_MESSAGES.future;
        break;
      default:
        message = NO_EVENTS_MESSAGES.everything;
    }

    if (this.events.length === 0) {
      const noEventsView = new NoEventsView(message);
      render(noEventsView, this.#eventsListComponent.element);
    } else {
      this.#eventsListComponent.element.innerHTML = '';
      this.events.forEach((event) => this._renderEvent(event));
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
  }
}
