import Observable from '../framework/observable.js';
import { USER_ACTIONS, SORT_TYPES } from '../const.js';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);

export default class BoardModel extends Observable {
  #events = [];
  #allOffers = [];
  #allDestinations = [];
  #currentSortType = SORT_TYPES.DAY;

  constructor({ eventsApiService }) {
    super();
    this.eventsApiService = eventsApiService;
  }

  set events(events) {
    this.#events = events;
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
    const offer = this.#allOffers.find((item) => item.type === type);
    return offer || null;
  }

  getOffersById(type, itemsId) {
    const offersType = this.getOffersByType(type);
    return offersType.offers.filter((item) => itemsId.find((id) => item.id === id));
  }

  getEventById(id) {
    return this.#events.find((event) => event.id === id);
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

  getSortedEvents(events, sortType) {
    switch (sortType) {
      case SORT_TYPES.TIME:
        return [...events].sort((a, b) => dayjs(b.dateTo).diff(b.dateFrom) - dayjs(a.dateTo).diff(a.dateFrom));
      case SORT_TYPES.PRICE:
        return [...events].sort((a, b) => b.basePrice - a.basePrice);
      case SORT_TYPES.DAY:
      default:
        return [...events].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
    }
  }
}
