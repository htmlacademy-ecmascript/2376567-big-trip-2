import { getRandomEvent, getOffers, getDestination } from '../mock/event';
import Observable from '../framework/observable.js';
import { USER_ACTIONS } from '../const.js';

export default class BoardModel extends Observable {
  #events = [];
  #allOffers = getOffers();
  #allDestinations = getDestination();
  EVENT_QTY = 5;

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

  addEvent(event) {
    this.#events = [event, ...this.#events];
    this._notify(USER_ACTIONS.ADD_EVENT, event);
  }

  updateEvent(event) {
    const index = this.#events.findIndex((e) => e.id === event.id);
    if (index === -1) {
      throw new Error('Event not found');
    }
    this.#events = [
      ...this.#events.slice(0, index),
      event,
      ...this.#events.slice(index + 1),
    ];
    this._notify(USER_ACTIONS.UPDATE_EVENT, event);
  }

  deleteEvent(eventId) {
    const index = this.#events.findIndex((e) => e.id === eventId);
    if (index === -1) {
      throw new Error('Event not found');
    }
    this.#events = [
      ...this.#events.slice(0, index),
      ...this.#events.slice(index + 1),
    ];
    this._notify(USER_ACTIONS.DELETE_EVENT, eventId);
  }
}
