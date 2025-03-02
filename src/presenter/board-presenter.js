import EventsListView from '../view/events-list-view.js';
import { NoPointView } from '../view/no-point-view.js';
import { render } from '../framework/render.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import SortPresenter from './sort-presenter.js';
import EventsPresenter from './events-presenter.js';

dayjs.extend(isBetween);
export default class BoardPresenter {
  #eventsListComponent = new EventsListView();
  #boardContainer = null;
  #boardModel = null;
  #eventsPresenters = new Map();

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
      eventsListComponent: this.#eventsListComponent
    };

    const eventsPresenter = new EventsPresenter(eventsPresenterParams);
    eventsPresenter.init();
    eventsPresenter.events.forEach((eventPresenter) => {
      this.#eventsPresenters.set(eventPresenter.id, eventPresenter);
    });
    console.log(this.#eventsPresenters);
  }

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
