import Observable from '../framework/observable.js';
import { USER_ACTIONS, SORT_TYPES } from '../const.js';

export default class BoardModel extends Observable {
  #events = [];
  #allOffers = [];
  #allDestinations = [];
  #currentSortType = SORT_TYPES.DAY;

  constructor({ eventsApiService }) {
    super();
    this.eventsApiService = eventsApiService;
  }

  _notify(updateType, data) {
    console.groupCollapsed(`Model Update: ${updateType}`);
    console.log('Data:', data);
    console.log('Current events:', this.#events); // Логируем текущее состояние
    console.trace('Update origin'); // Покажет, откуда пришло обновление
    console.groupEnd();

    // this._observers.forEach(observer => observer(updateType, data));
  }

  // _notify(updateType, data) {
  //   console.log(`Update: ${updateType}`, data);
  //   // this._observers.forEach(observer => observer(updateType, data));
  // }

  set events(events) {
    this.#events = events;
    // this._notify(USER_ACTIONS.EVENTS_LOADED, events);
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
    // this._notify(USER_ACTIONS.EVENTS_LOADED, events);
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

  async addEvent(event) {
    const addedEvent = await this.eventsApiService.addPoint(event);
    this.#events = [addedEvent, ...this.#events];
    this._notify(USER_ACTIONS.ADD_EVENT, addedEvent);
    return addedEvent;
  }

  async updateEvent(event) {

    const updatedEvent = await this.eventsApiService.updatePoint(event);
    const index = this.#events.findIndex((e) => e.id === updatedEvent.id);

    this.#events = [
      ...this.#events.slice(0, index),
      updatedEvent,
      ...this.#events.slice(index + 1)
    ];

    this._notify(USER_ACTIONS.UPDATE_EVENT, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(eventId) {

    await this.eventsApiService.deletePoint(eventId);

    const index = this.#events.findIndex((e) => e.id === eventId);
    if (index !== -1) {
      this.#events = [
        ...this.#events.slice(0, index),
        ...this.#events.slice(index + 1)
      ];
      this._notify(USER_ACTIONS.DELETE_EVENT, eventId);
    }
  }

  changeSortType(sortType) {
    this.#currentSortType = sortType;
    this._notify(USER_ACTIONS.SORT_CHANGED, sortType);
  }

  getCurrentSortType() {
    return this.#currentSortType;
  }
}
