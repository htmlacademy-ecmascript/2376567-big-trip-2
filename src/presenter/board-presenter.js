import EventsListView from '../view/events-list-view.js';
import NoPointView from '../view/no-point-view.js';
import { render } from '../framework/render.js';
import SortPresenter from './sort-presenter.js';
import EventsPresenter from './events-presenter.js';
import { USER_ACTIONS } from '../const.js';
import { FILTERS } from '../const.js';

export default class BoardPresenter {
  #eventsListComponent = new EventsListView(); // Компонент списка событий
  #boardContainer = null; // Контейнер доски
  #boardModel = null; // Модель доски
  #filterModel = null; // Модель фильтров
  #eventsPresenter = null; // Презентер событий
  #addEventForm = null; // Форма добавления события

  constructor({ boardContainer, boardModel, filterModel }) {
    this.#boardContainer = boardContainer;
    this.#boardModel = boardModel;
    this.#filterModel = filterModel;

    this.#filterModel.addObserver((filter) => this._handleFilterUpdate(filter));
    this.#boardModel.addObserver((actionType, payload) => this._handleModelChange(actionType, payload));
  }

  init() {
    this._renderBoard();
  }

  _renderSort(eventsPresenter) {
    const sortPresenter = new SortPresenter({
      boardContainer: this.#boardContainer,
      eventsPresenter: eventsPresenter,
      boardModel: this.#boardModel,
    });

    sortPresenter.init();
  }

  _renderEvents() {
    this.#eventsPresenter.init(this.#eventsListComponent);
  }

  _handleEventChange = async (updatedEvent) => {
    try {
      const savedEvent = await this.#boardModel.updateEvent(updatedEvent);
      const modelEvents = this.#boardModel.events;
      if (!modelEvents.some(e => e.id === savedEvent.id)) {
        this.#eventsPresenter.updateEvents(modelEvents);
        return;
      }
      this.#eventsPresenter.updateEvent(savedEvent);
    } catch {
      this.#eventsPresenter.updateEvents(this.#boardModel.events);
    }
  };

  _renderBoard() {
    const events = this.#boardModel.events;
    const destinations = this.#boardModel.destinations;
    const offers = this.#boardModel.offers;

    const eventsPresenterParams = {
      events,
      destinations,
      offers,
      boardModel: this.#boardModel,
      eventsListComponent: this.#eventsListComponent,
      onDataChange: this._handleEventChange,
      filterModel: this.#filterModel,
      boardContainer: this.#boardContainer,
    };

    this.#eventsPresenter = new EventsPresenter(eventsPresenterParams);
    this._renderSort(this.#eventsPresenter);

    if (events.length === 0) {
      const noPointView = new NoPointView();
      render(noPointView, this.#boardContainer);
    }

    render(this.#eventsListComponent, this.#boardContainer);
    this._renderEvents();
  }

  _handleFilterUpdate() {
    const filteredEvents = this.#filterModel.filterEvents(this.#boardModel.events);
    this.#eventsPresenter.updateEvents(filteredEvents);
  }

  updateEvents(filteredEvents) {
    this.#eventsPresenter.updateEvents(filteredEvents);
  }

  showAddEventForm(addEventView) {
    if (this.#addEventForm) {
      this.#addEventForm.removeElement();
    }
    this.#addEventForm = addEventView;
    this.#eventsPresenter.resetAllViews();
    render(this.#addEventForm, this.#eventsListComponent.element, 'afterbegin');
  }

  _handleModelChange(actionType, payload) {
    console.log('Model change:', actionType, payload);

    switch (actionType) {
      case USER_ACTIONS.ADD_EVENT:
        this.#eventsPresenter.updateEvent(payload);
        break;
      case USER_ACTIONS.UPDATE_EVENT:
        this.#eventsPresenter.updateEvent(payload); // Используем метод из EventsPresenter для добавления и обновления событий
        break;
      case USER_ACTIONS.DELETE_EVENT:
        this.#eventsPresenter.updateEvents(this.#boardModel.events); // Полное обновление списка событий после удаления
        break;
      default:
        console.log(`Необработанное событие: ${actionType}`);
    }
  }

  resetAllViews() {
    this.#eventsPresenter.resetAllViews();
  }

  resetFiltersAndSorting() {
    this.#filterModel.setFilter(FILTERS[0]);
    this.#eventsPresenter.resetAllViews();
  }
}
