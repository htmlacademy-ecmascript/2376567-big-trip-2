import SortView from '../view/sort-view.js';
import EventView from '../view/event-view.js';
// import EditEventView from '../view/edit-event-view.js';
import EventsListView from '../view/events-list-view.js';
import AddEventView from '../view/add-event-view.js';
import { render } from '../render.js';
import BoardModel from '../model/board-model.js';

export default class BoardPresenter {
  eventsListComponent = new EventsListView();

  constructor({ boardContainer }) {
    this.boardContainer = boardContainer;
  }

  init() {

    const boardModel = new BoardModel();

    this.events = [...boardModel.getEvents()];
    this.destinations = [...boardModel.getDestinations()];
    this.offers = [...boardModel.getOffers()];

    const firstEvent = this.events[0];
    const firstDestination = boardModel.getDestinationsById(firstEvent.destination);
    const firstOffer = boardModel.getOffersByType(firstEvent.type);

    render(new SortView(), this.boardContainer);
    render(this.eventsListComponent, this.boardContainer);
    render(
      new AddEventView(firstEvent, firstDestination, firstOffer, this.destinations),
      this.eventsListComponent.getElement()
    );

    for (let i = 0; i < this.events.length; i++) {
      const event = this.events[i];
      const destination = boardModel.getDestinationsById(event.destination);
      const offer = boardModel.getOffersByType(event.type);

      render(
        new EventView(event, destination, offer),
        this.eventsListComponent.getElement()
      );
    }
  }
}
