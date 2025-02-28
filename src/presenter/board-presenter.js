import SortView from '../view/sort-view.js';
import EventView from '../view/event-view.js';
import EventsListView from '../view/events-list-view.js';
import AddEventView from '../view/add-event-view.js';
import { NoPointView } from '../view/no-point-view.js';
import { render, replace } from '../framework/render.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);
export default class BoardPresenter {
  eventsListComponent = new EventsListView();
  #currentEventComponent = null;
  #currentAddEventComponent = null;

  constructor({ boardContainer, boardModel, observer }) {
    this.boardContainer = boardContainer;
    this.boardModel = boardModel;
    this.observer = observer;
    this.observer.addObserver((event) => this.update(event));
  }

  init() {
    this.events = [...this.boardModel.events];
    this.destinations = [...this.boardModel.destinations];
    this.offers = [...this.boardModel.offers];

    const sortView = new SortView();
    render(sortView, this.boardContainer);

    render(this.eventsListComponent, this.boardContainer);

    if (this.events.length === 0) {
      const noPointView = new NoPointView();
      render(noPointView, this.boardContainer);
    }

    this._renderEvents();
  }

  _renderEvents() {
    this.eventsListComponent.element.innerHTML = '';

    const filteredEvents = this.events.filter((event) => {
      const filter = this.observer.filters;
      switch (filter.value) {
        case 'everything':
          return true;
        case 'future':
          return dayjs(event.dateFrom).isAfter(dayjs());
        case 'present':
          return dayjs().isBetween(dayjs(event.dateFrom), dayjs(event.dateTo));
        case 'past':
          return dayjs(event.dateFrom).isBefore(dayjs());
        default:
          return true;
      }
    });

    for (let i = 0; i < filteredEvents.length; i++) {
      const event = filteredEvents[i];
      const destination = this.boardModel.getDestinationsById(event.destination);
      const offer = this.boardModel.getOffersByType(event.type);
      this._renderEvent(event, destination, offer);
    }
  }

  _renderEvent(event, destination, offer) {
    const eventView = new EventView(event, destination, offer);
    const liElement = document.createElement('li');
    liElement.classList.add('trip-events__item');
    liElement.appendChild(eventView.element);

    this.eventsListComponent.element.appendChild(liElement);

    eventView.setRollupClickHandler(() => this._replaceEventWithForm(event, destination, offer, eventView));
  }

  _replaceEventWithForm(event, destination, offer, eventView) {
    const addEventView = new AddEventView(event, destination, offer, this.destinations);

    this.#currentEventComponent = eventView;
    this.#currentAddEventComponent = addEventView;

    addEventView.setFormSubmitHandler(() => this._replaceFormWithEvent());
    addEventView.setEscKeyDownHandler(() => this._replaceFormWithEvent());
    addEventView.setCloseButtonClickHandler(() => this._replaceFormWithEvent());

    replace(addEventView, eventView);
  }

  _replaceFormWithEvent() {
    replace(this.#currentEventComponent, this.#currentAddEventComponent);
    this.#currentAddEventComponent.removeElement();
    this.#currentEventComponent = null;
    this.#currentAddEventComponent = null;
  }

  update(event) {
    if (event === 'FILTER_CHANGED') {
      this._renderEvents();
    }
  }
}
