import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import EventPresenter from './event-presenter';
dayjs.extend(isBetween);

export default class EventsPresenter {
  #events = null;
  #destinations = null;
  #offers = null;
  #observer = null;
  #boardModel = null;
  #eventsListComponent = null;
  #onDataChange = null;
  #eventPresenters = new Map();

  constructor({ events, destinations, offers, observer, boardModel, eventsListComponent, onDataChange }) {
    this.#events = events;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#observer = observer;
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
      onFormOpen: this.resetAllViews.bind(this),
    });

    eventPresenter.init(this.#eventsListComponent.element);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  _renderEvents() {
    this.#eventsListComponent.element.innerHTML = '';

    const filteredEvents = this.#events.filter((event) => {
      const filter = this.#observer.filters;
      switch (filter.value) {
        case 'everything':
          return true;
        case 'future':
          return dayjs(event.dateFrom).isAfter(dayjs());
        case 'present':
          return dayjs().isBetween(dayjs(event.dateFrom), dayjs(event.dateTo));
        case 'past':
          return dayjs(event.dateFrom).isBefore(dayjs());
        default:
          return true;
      }
    });

    filteredEvents.forEach((event) => this._renderEvent(event));
  }

  updateEvent(updatedEvent) {
    const eventPresenter = this.#eventPresenters.get(updatedEvent.id);
    if (eventPresenter) {
      const destination = this.#boardModel.getDestinationsById(updatedEvent.destination);
      const offer = this.#boardModel.getOffersByType(updatedEvent.type);
      eventPresenter.update(updatedEvent, destination, offer);
    }
  }

  resetAllViews() {
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
  }
}
