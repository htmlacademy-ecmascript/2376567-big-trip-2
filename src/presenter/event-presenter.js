import EventView from '../view/event-view.js';
import EditEventView from '../view/edit-event-view.js';
import { replace } from '../framework/render.js';

export default class EventPresenter {
  #event = null;
  #destination = null;
  #offer = null;
  #eventView = null;
  #editEventView = null;
  #onDataChange = null;
  #destinationAll = null;
  #offerAll = null;
  #onFormOpen = null;
  #onUserAction = null;

  constructor({ event, destination, offer, onDataChange, destinationAll, offerAll, onFormOpen, onUserAction }) {
    this.#event = event;
    this.#destination = destination;
    this.#offer = offer;
    this.#onDataChange = onDataChange;
    this.#destinationAll = destinationAll;
    this.#offerAll = offerAll;
    this.#onFormOpen = onFormOpen;
    this.#onUserAction = onUserAction;
  }

  init(container) {
    this.#eventView = new EventView(this.#event, this.#destination, this.#offer, this.#destinationAll, this.#offerAll);
    this.#eventView.setRollupClickHandler(() => this._replaceEventWithForm());
    this.#eventView.setFavoriteBtnClickHandler(() => this.#onDataChange({ ...this.#event, favorite: !this.#event.favorite }));

    container.appendChild(this.#eventView.element);
  }

  update(event, destination, offer) {
    this.#event = event;
    this.#destination = destination;
    this.#offer = offer;

    const prevEventView = this.#eventView;
    this.#eventView = new EventView(this.#event, this.#destination, this.#offer, this.#destinationAll, this.#offerAll);
    this.#eventView.setRollupClickHandler(() => this._replaceEventWithForm());
    this.#eventView.setFavoriteBtnClickHandler(() => this.#onDataChange({ ...this.#event, favorite: !this.#event.favorite }));

    replace(this.#eventView, prevEventView);
    prevEventView.removeElement();
  }

  resetView() {
    if (this.#editEventView) {
      this._replaceFormWithEvent();
    }
  }

  _replaceEventWithForm() {
    this.#onFormOpen();

    this.#editEventView = new EditEventView(
      this.#event,
      this.#destination,
      this.#offer,
      this.#destinationAll,
      this.#offerAll,
      () => this._deleteFormEvent()
    );

    this.#editEventView.setFormSubmitHandler(() => this._replaceFormWithEvent());
    this.#editEventView.setEscKeyDownHandler(() => this._replaceFormWithEvent());
    this.#editEventView.setCloseButtonClickHandler(() => this._deleteFormEvent());
    this.#editEventView.setRollupButtonClickHandler(() => this._replaceFormWithEvent());

    if (this.#eventView.element.parentElement) {
      replace(this.#editEventView, this.#eventView);
    }
  }

  _replaceFormWithEvent() {
    if (!this.#editEventView) {
      return;
    }
    const parent = this.#editEventView.element.parentElement;
    if (parent) {
      parent.replaceChild(this.#eventView.element, this.#editEventView.element);
    }
    this.#editEventView.removeElement();
    this.#editEventView = null;
  }

  _deleteFormEvent() {
    this.#onUserAction('DELETE_EVENT', this.#event.id);
  }
}
