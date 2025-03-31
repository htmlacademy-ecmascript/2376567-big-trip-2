import EventPresenter from './event-presenter.js';
import NoEventsView from '../view/no-events-view.js';
import { render } from '../framework/render.js';
import { USER_ACTIONS } from '../const.js';

export default class EventsPresenter {
  #events = []; // Список событий
  #destinations = []; // Список мест назначений
  #offers = []; // Список предложений
  #boardModel = null; // Модель доски
  #eventsListComponent = null; // Компонент списка событий
  #onDataChange = null; // Обработчик изменения данных
  #eventPresenters = new Map(); // Карта презентеров событий
  #filterModel = null; // Модель фильтров
  #boardContainer = null; // Контейнер доски

  constructor({ events, destinations, offers, boardModel, eventsListComponent, onDataChange, filterModel, boardContainer }) {
    this.#events = events;
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
        console.log('Удаляем событие из презентера', eventId);
        await this.handleDeleteEvent(eventId);
      }
    });

    eventPresenter.init(this.#eventsListComponent.element);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  async handleDeleteEvent(eventId) {
    try {
      await this.#boardModel.deleteEvent(eventId);
      this._renderEvents();
    } catch (error) {
      console.error('Ошибка при удалении события:', error);
      throw error;
    }
  }

  _renderEvents() {
    this.#eventsListComponent.element.innerHTML = '';

    let message = '';
    switch (this.#filterModel.filters.value) {
      case 'everything':
        message = 'Click New Event to create your first point';
        break;
      case 'past':
        message = 'There are no past events now';
        break;
      case 'present':
        message = 'There are no present events now';
        break;
      case 'future':
        message = 'There are no future events now';
        break;
      default:
        message = 'Click New Event to create your first point';
    }

    if (this.#events.length === 0) {
      const noEventsView = new NoEventsView(message);
      render(noEventsView, this.#eventsListComponent.element);
    } else {
      this.#events.forEach((event) => this._renderEvent(event));
    }
  }

  handleUserAction(actionType, payload) {
    switch (actionType) {
      case USER_ACTIONS.ADD_EVENT:
        // Обработка добавления события теперь в HeaderPresenter
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
    this.#events = filteredEvents;
    this._renderEvents();
  }

  resetAllViews() {
    console.log('resetAllViews');
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
  }
}
