import { getRandomEvent, getOffers, getDestination } from '../mock/event';
import Observable from '../framework/observable.js';

export default class BoardModel extends Observable {
  #events = [];
  #allOffers = getOffers();
  #allDestinations = getDestination();
  EVENT_QTY = 10;

  constructor() {
    super();
    for (let i = 0; i < this.EVENT_QTY; i++) {
      const id = i + 1;
      this.#events.push(getRandomEvent(id));
    }
  }

  get events() {
    return this.#events;
  }

  get offers() {
    return this.#allOffers;
  }

  get destinations() {
    return this.#allDestinations;
  }

  getDestinationsById(id) {
    const allDestinations = this.destinations;
    return allDestinations.find((item) => item.id === id);
  }

  getOffersByType(type) {
    return this.#allOffers.find((offer) => offer.type === type);
  }

  getOffersById(type, itemsId) {
    const offersType = this.getOffersByType(type);
    return offersType.offers.filter((item) => itemsId.find((id) => item.id === id));
  }

  updateEvent(updateType, update) {
    const index = this.#events.findIndex((event) => event.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update non-existing event');
    }

    this.#events = [
      ...this.#events.slice(0, index),
      update,
      ...this.#events.slice(index + 1)
    ];

    this._notify(updateType, update);
  }

  // patchEvent(updateType, eventId, updates) {
  //   const index = this.#events.findIndex((event) => event.id === eventId);

  //   if (index === -1) {
  //     throw new Error('Can\'t patch non-existing event');
  //   }

  //   const updatedEvent = { ...this.#events[index], ...updates };

  //   this.#events = [
  //     ...this.#events.slice(0, index),
  //     updatedEvent,
  //     ...this.#events.slice(index + 1)
  //   ];

  //   this._notify(updateType, updatedEvent);
  // }

  addEvent(updateType, newEvent) {
    this.#events = [
      newEvent,
      ...this.#events
    ];

    this._notify(updateType, newEvent);
  }

  deleteEvent(updateType, event) {
    const index = this.#events.findIndex((currentEvent) => currentEvent.id === event.id);

    if (index === -1) {
      throw new Error('Can\'t delete non-existing event');
    }

    this.#events = [
      ...this.#events.slice(0, index),
      ...this.#events.slice(index + 1)
    ];

    this._notify(updateType);
  }
}
