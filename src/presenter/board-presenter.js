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

  constructor({ boardContainer, boardModel, observer }) {
    this.#boardContainer = boardContainer;
    this.#boardModel = boardModel;
    this.observer = observer;
    this.observer.addObserver((event) => this.update(event));
  }

  init() {
    this.events = [...this.#boardModel.events];
    this.destinations = [...this.#boardModel.destinations];
    this.offers = [...this.#boardModel.offers];

    this._renderBoard();
  }

  _renderSort() {
    const sortPresenter = new SortPresenter({
      boardContainer: this.#boardContainer,
    });

    sortPresenter.init();
  }

  _renderEvents() {
    const eventsPresenterParams = {
      events: this.events,
      destinations: this.destinations,
      offers: this.offers,
      observer: this.observer,
      boardModel: this.#boardModel,
      eventsListComponent: this.#eventsListComponent,
      onDataChange: this._handleEventChange,
    };

    this.#eventsPresenter = new EventsPresenter(eventsPresenterParams);
    this.#eventsPresenter.init();
  }

  _handleEventChange = (updatedEvent) => {
    this.events = updateItem(this.events, updatedEvent);
    this.#eventsPresenter.updateEvent(updatedEvent);
  };

  _renderBoard() {
    this._renderSort();

    if (this.events.length === 0) {
      const noPointView = new NoPointView();
      render(noPointView, this.#boardContainer);
    }

    render(this.#eventsListComponent, this.#boardContainer);

    this._renderEvents();
  }

  update(event) {
    if (event === 'FILTER_CHANGED') {
      this._renderEvents();
    }
  }
}
