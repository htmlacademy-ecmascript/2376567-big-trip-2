import EventView from '../view/event-view.js';
import AddEventView from '../view/add-event-view.js';
import { replace } from '../framework/render.js';

export default class EventPresenter {
  #event = null;
  #destination = null;
  #offer = null;
  #eventView = null;
  #addEventView = null;
  #onDataChange = null;
  #destinationAll = null;

  constructor({ event, destination, offer, onDataChange, destinationAll }) {
    this.#event = event;
    this.#destination = destination;
    this.#offer = offer;
    this.#onDataChange = onDataChange;
    this.#destinationAll = destinationAll;
  }

  init(container) {
    this.#eventView = new EventView(this.#event, this.#destination, this.#offer);
    this.#eventView.setRollupClickHandler(() => this._replaceEventWithForm());
    this.#eventView.setFavoriteBtnClickHandler(() => this.#onDataChange({ ...this.#event, favorite: !this.#event.favorite }));

    container.appendChild(this.#eventView.element);
  }

  update(event, destination, offer) {
    this.#event = event;
    this.#destination = destination;
    this.#offer = offer;

    const prevEventView = this.#eventView;
    this.#eventView = new EventView(this.#event, this.#destination, this.#offer);
    this.#eventView.setRollupClickHandler(() => this._replaceEventWithForm());
    this.#eventView.setFavoriteBtnClickHandler(() => this.#onDataChange({ ...this.#event, favorite: !this.#event.favorite }));

    replace(this.#eventView, prevEventView);
    prevEventView.removeElement();
  }

  _replaceEventWithForm() {
    this.#addEventView = new AddEventView(this.#event, this.#destination, this.#offer, this.#destinationAll);
    this.#addEventView.setFormSubmitHandler(() => this._replaceFormWithEvent());
    this.#addEventView.setEscKeyDownHandler(() => this._replaceFormWithEvent());
    this.#addEventView.setCloseButtonClickHandler(() => this._replaceFormWithEvent());

    replace(this.#addEventView, this.#eventView);
  }

  _replaceFormWithEvent() {
    replace(this.#eventView, this.#addEventView);
    this.#addEventView.removeElement();
    this.#addEventView = null;
  }
}
