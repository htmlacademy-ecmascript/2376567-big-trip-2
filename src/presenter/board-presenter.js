import SortView from '../view/sort-view.js';
import EventView from '../view/event-view.js';
import EditEventView from '../view/edit-event-view.js';
import EventsListView from '../view/events-list-view.js';
import AddEventView from '../view/add-event-view.js';
import { render } from '../render.js';

const RENDER_EVENT_QTY = 3;

export default class BoardPresenter {
  eventsListComponent = new EventsListView();
  constructor({boardContainer}) {
    this.boardContainer = boardContainer;
  }

  init() {
    render(new SortView(), this.boardContainer);
    render(this.eventsListComponent, this.boardContainer);
    render(new EditEventView(), this.eventsListComponent.getElement());
    for (let i = 0; i < RENDER_EVENT_QTY; i++) {
      render(new EventView(), this.eventsListComponent.getElement());
    }
    render(new AddEventView(), this.eventsListComponent.getElement());
  }
}

