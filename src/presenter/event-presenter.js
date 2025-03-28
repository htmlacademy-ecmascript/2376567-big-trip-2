import EventView from '../view/event-view.js';
import EditEventView from '../view/edit-event-view.js';
import { replace } from '../framework/render.js';
import { convertDateToISO } from '../utils.js';

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

    prevEventView.removeElement();
    replace(this.#eventView, prevEventView);
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

    this.#editEventView.setFormSubmitHandler(() => this._handleFormSubmit());
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

  _handleFormSubmit() {
    const formData = new FormData(this.#editEventView.element);
    const destinationName = formData.get('event-destination');

    // Находим полный объект destination по имени
    const destination = this.#destinationAll.find((dest) => dest.name === destinationName);

    // Валидация назначения
    if (!destination) {
      this.#editEventView.shake();
      // this.#editEventView.showError('Please select a valid destination from the list');
      return;
    }

    const dateFromString = formData.get('event-start-time');
    const dateToString = formData.get('event-end-time');

    const updatedEvent = {
      id: this.#event.id,
      type: formData.get('event-type'),
      dateFrom: convertDateToISO(dateFromString),
      dateTo: convertDateToISO(dateToString),
      basePrice: Number(formData.get('event-price')),
      destination: destination.id, // Используем UUID из найденного объекта
      offersId: Array.from(this.#editEventView.element.querySelectorAll('.event__offer-checkbox:checked'))
        .map((input) => Number(input.value)),
      favorite: this.#event.favorite,
    };

    this.#onDataChange(updatedEvent)
      .then(() => {
        this._replaceFormWithEvent();
      })
      .catch((err) => {
        console.error('Failed to save event:', err);
        this.#editEventView.showError('Failed to save changes. Please try again.');
      });
  }
}

