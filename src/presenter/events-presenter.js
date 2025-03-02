import EventView from '../view/event-view';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import AddEventView from '../view/add-event-view';
import { replace } from '../framework/render';
dayjs.extend(isBetween);


export default class EventsPresenter {
  events = null;
  #destinations = null;
  #offers = null;
  #observer = null;
  #boardModel = null;
  #eventsListComponent = null;
  #currentEventComponent = null;
  #currentAddEventComponent = null;

  constructor({ events, destinations, offers, observer, boardModel, eventsListComponent }) {
    this.events = events;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#observer = observer;
    this.#boardModel = boardModel;
    this.#eventsListComponent = eventsListComponent
  }

  init() {
    this._renderEvents();
  }

  _renderEvent(event, destination, offer) {
    const eventView = new EventView(event, destination, offer);
    const liElement = document.createElement('li');
    liElement.classList.add('trip-events__item');
    liElement.appendChild(eventView.element);

    this.#eventsListComponent.element.appendChild(liElement);

    eventView.setRollupClickHandler(() => this._replaceEventWithForm(event, destination, offer, eventView));
  }

  _renderEvents() {
    this.#eventsListComponent.element.innerHTML = '';

    const filteringEvents = (events) => {
      const filteredEvents = events.filter((event) => {
        const filter = this.#observer.filters;
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
      return filteredEvents;
    };


    for (let i = 0; i < filteringEvents(this.events).length; i++) {
      const event = filteringEvents(this.events)[i];
      const destination = this.#boardModel.getDestinationsById(event.destination);
      const offer = this.#boardModel.getOffersByType(event.type);
      this._renderEvent(event, destination, offer);
    }
  }

  _replaceEventWithForm(event, destination, offer, eventView) {
    const addEventView = new AddEventView(event, destination, offer, this.#destinations);

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
}
