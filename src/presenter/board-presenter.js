import EventsListView from '../view/events-list-view.js';
import { NoPointView } from '../view/no-point-view.js';
import { render } from '../framework/render.js';
import SortPresenter from './sort-presenter.js';
import EventsPresenter from './events-presenter.js';

export default class BoardPresenter {
  #eventsListComponent = new EventsListView();
  #boardContainer = null;
  #boardModel = null;
  #filterModel = null;
  #eventsPresenter = null;

  constructor({ boardContainer, boardModel, filterModel }) {
    this.#boardContainer = boardContainer;
    this.#boardModel = boardModel;
    this.#filterModel = filterModel;

    this.#filterModel.addObserver((filter) => this._handleFilterUpdate(filter));
  }

  init() {
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
    this.#boardModel.updateEvent('UPDATE_EVENT', updatedEvent);
    this.#eventsPresenter.updateEvent(updatedEvent);
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
}
