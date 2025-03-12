import EventPresenter from './event-presenter.js';

export default class EventsPresenter {
  events = null;
  #destinations = null;
  #offers = null;
  #boardModel = null;
  #eventsListComponent = null;
  #onDataChange = null;
  #eventPresenters = new Map();

  constructor({ events, destinations, offers, boardModel, eventsListComponent, onDataChange }) {
    this.events = events;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#boardModel = boardModel;
    this.#eventsListComponent = eventsListComponent;
    this.#onDataChange = onDataChange;
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
    });

    eventPresenter.init(this.#eventsListComponent.element);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  _renderEvents() {
    this.#eventsListComponent.element.innerHTML = '';
    this.events.forEach((event) => this._renderEvent(event));
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
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
  }
}
