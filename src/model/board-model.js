import Observable from '../framework/observable.js';
import { USER_ACTIONS } from '../const.js';

export default class BoardModel extends Observable {
  #events = [];
  #allOffers = [];
  #allDestinations = [];
  #currentSortType = 'day';

  constructor({ eventsApiService }) {
    super();
    this.eventsApiService = eventsApiService;
  }

  set events(events) {
    this.#events = events;
    this._notify('EVENTS_LOADED', events);
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

  async loadEvents() {
    const events = await this.eventsApiService.points;
    this.#events = events;
    this._notify('EVENTS_LOADED', events);
  }

  async loadOffers() {
    const offers = await this.eventsApiService.getOffers();
    this.#allOffers = offers;
  }

  async loadDestinations() {
    const destinations = await this.eventsApiService.getDestinations();
    this.#allDestinations = destinations;
  }

  getDestinationsById(id) {
    return this.destinations.find((item) => item.id === id);
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

  async updateEvent(event) {
    try {
      const updatedEvent = await this.eventsApiService.updatePoint(event);
      const index = this.#events.findIndex((e) => e.id === updatedEvent.id);
      this.#events = [
        ...this.#events.slice(0, index),
        updatedEvent,
        ...this.#events.slice(index + 1),
      ];
      this._notify(USER_ACTIONS.UPDATE_EVENT, updatedEvent);
      return updatedEvent;
    } catch (err) {
      console.error('Ошибка при обновлении точки маршрута:', err);
      throw err;
    }
  }

  deleteEvent(eventId) {
    const index = this.#events.findIndex((e) => e.id === eventId);
    this.#events = [
      ...this.#events.slice(0, index),
      ...this.#events.slice(index + 1),
    ];
    this._notify(USER_ACTIONS.DELETE_EVENT, eventId);
  }

  changeSortType(sortType) {
    this.#currentSortType = sortType;
    this._notify('SORT_CHANGED', sortType);
  }

  getCurrentSortType() {
    return this.#currentSortType;
  }
}
