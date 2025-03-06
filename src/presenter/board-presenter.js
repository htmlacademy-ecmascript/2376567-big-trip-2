import EventsListView from '../view/events-list-view.js';
import { NoPointView } from '../view/no-point-view.js';
import { render } from '../framework/render.js';
import SortPresenter from './sort-presenter.js';
import EventsPresenter from './events-presenter.js';
import { updateItem } from '../utils.js';
export default class BoardPresenter {
  #eventsListComponent = new EventsListView();
  #boardContainer = null;
  #boardModel = null;
  #eventsPresenter = null;
  #filtersPresenter = null;

  constructor({ boardContainer, boardModel, filtersPresenter }) {
    this.#boardContainer = boardContainer;
    this.#boardModel = boardModel;
    this.#filtersPresenter = filtersPresenter;

    this.#filtersPresenter.addObserver((event) => this._handleFilterUpdate(event));
  }

  init() {
    this.events = [...this.#boardModel.events];
    this.destinations = [...this.#boardModel.destinations];
    this.offers = [...this.#boardModel.offers];

    this._renderBoard();
  }

  _renderSort(eventsPresenter) {
    const sortPresenter = new SortPresenter({
      boardContainer: this.#boardContainer,
      eventsPresenter: eventsPresenter,
    });

    sortPresenter.init();
  }

  _renderEvents(eventsListComponent = this.#eventsListComponent) {
    this.#eventsPresenter.init(eventsListComponent);
  }

  _handleEventChange = (updatedEvent) => {
    this.events = updateItem(this.events, updatedEvent);
    this.#eventsPresenter.updateEvent(updatedEvent);
  };

  _renderBoard() {
    const eventsPresenterParams = {
      events: this.events,
      destinations: this.destinations,
      offers: this.offers,
      boardModel: this.#boardModel,
      eventsListComponent: this.#eventsListComponent,
      onDataChange: this._handleEventChange,
    };
    this.#eventsPresenter = new EventsPresenter(eventsPresenterParams);
    this._renderSort(this.#eventsPresenter);

    if (this.events.length === 0) {
      const noPointView = new NoPointView();
      render(noPointView, this.#boardContainer);
    }

    render(this.#eventsListComponent, this.#boardContainer);
    this._renderEvents();
  }

  _handleFilterUpdate(event) {
    if (event === 'FILTER_CHANGED') {
      const filteredEvents = this.#filtersPresenter.filterEvents(this.events, this.#filtersPresenter.filters);
      this.#eventsPresenter.updateEvents(filteredEvents);
    }
  }

  updateEvents(filteredEvents) {
    this.#eventsPresenter.updateEvents(filteredEvents);
  }
}
