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
    this._notify(USER_ACTIONS.EVENTS_LOADED, events);
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
    console.log(events);
    this.#events = events;
    this._notify(USER_ACTIONS.EVENTS_LOADED, events);
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
    try {
      // 1. Сначала отправляем на сервер
      const addedEvent = await this.eventsApiService.addPoint(event);

      // 2. Только после успешного ответа обновляем модель

      this.#events = [addedEvent, ...this.#events];
      console.log('событие обновлено');
      this._notify(USER_ACTIONS.ADD_EVENT, addedEvent);
      return addedEvent; // Возвращаем промис
    } catch (err) {
      console.error('Add event error:', err);
      throw err; // Пробрасываем ошибку для обработки в презентере
    }
  }

  async updateEvent(event) {

    try {
      // Проверяем обязательные поля перед отправкой
      if (!event?.id || !event.destination) {
        throw new Error('Invalid event data');
      }

      const updatedEvent = await this.eventsApiService.updatePoint(event);
      const index = this.#events.findIndex(e => e.id === updatedEvent.id);

      if (index === -1) {
        throw new Error('Event not found in local model');
      }

      this.#events = [
        ...this.#events.slice(0, index),
        updatedEvent,
        ...this.#events.slice(index + 1)
      ];

      this._notify(USER_ACTIONS.UPDATE_EVENT, updatedEvent);
      return updatedEvent;
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      // Не ожидаем данных в ответе, только статус
      await this.eventsApiService.deletePoint(eventId);

      const index = this.#events.findIndex((e) => e.id === eventId);
      if (index !== -1) {
        this.#events = [
          ...this.#events.slice(0, index),
          ...this.#events.slice(index + 1)
        ];
        this._notify(USER_ACTIONS.DELETE_EVENT, eventId);
      }
    } catch (error) {
      console.error('Ошибка при удалении события', error);
      throw error;
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
