import EventView from '../view/event-view.js';
import EditEventView from '../view/edit-event-view.js';
import { replace } from '../framework/render.js';
import { convertDateToISO } from '../utils.js';
import { POINT_TYPES } from '../const.js';

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
  #onDelete = null;
  #resetFiltersAndSorting = null;
  #uiBlocker = null;

  constructor({ event, destination, offer, onDataChange, destinationAll, offerAll, onFormOpen, onUserAction, onDelete, resetFiltersAndSorting, uiBlocker }) {
    this.#event = event;
    this.#destination = destination;
    this.#offer = offer;
    this.#onDataChange = onDataChange;
    this.#destinationAll = destinationAll;
    this.#offerAll = offerAll;
    this.#onFormOpen = onFormOpen;
    this.#onUserAction = onUserAction;
    this.#onDelete = onDelete;
    this.#resetFiltersAndSorting = resetFiltersAndSorting;
    this.#uiBlocker = uiBlocker;
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
      const parent = this.#editEventView.element.parentElement;
      if (parent) {
        parent.replaceChild(this.#eventView.element, this.#editEventView.element);
      }
      this.#editEventView.removeElement();
      this.#editEventView = null;
    }
  }

  destroy() {
    this.resetView();

    if (this.#eventView) {
      this.#eventView.removeElement();
      this.#eventView = null;
    }

    this.#onDataChange = null;
    this.#onFormOpen = null;
    this.#onUserAction = null;
    this.#onDelete = null;
  }

  _replaceEventWithForm() {
    this.#onFormOpen();

    const listItem = this.#eventView.element.closest('li.trip-events__item');
    if (!listItem) {
      return;
    }

    this.#editEventView = new EditEventView(
      this.#event,
      this.#destination,
      this.#offer,
      this.#destinationAll,
      this.#offerAll
    );

    this.#editEventView.setFormSubmitHandler(async (updatedEvent) => {
      this.#editEventView.setSaving(true);
      try {
        this.#uiBlocker.block();
        await this.#onDataChange(updatedEvent);
        this.#resetFiltersAndSorting();
        this._replaceFormWithEvent();
      } catch {
        this.#editEventView.shake();
      } finally {
        this.#editEventView?.setSaving(false);
        this.#uiBlocker.unblock();
      }
    });

    this.#editEventView.setDeleteClickHandler(() => this._deleteFormEvent());
    this.#editEventView.setEscKeyDownHandler(() => this._replaceFormWithEvent());
    this.#editEventView.setCloseButtonClickHandler(() => this._deleteFormEvent());
    this.#editEventView.setRollupButtonClickHandler(() => this._replaceFormWithEvent());

    listItem.innerHTML = '';
    listItem.appendChild(this.#editEventView.element);
  }

  _replaceFormWithEvent() {
    if (!this.#editEventView) {
      return;
    }

    const listItem = this.#editEventView.element.closest('li.trip-events__item');
    if (!listItem) {
      return;
    }

    listItem.innerHTML = '';
    listItem.appendChild(this.#eventView.element);

    this.#editEventView.removeElement();
    this.#editEventView = null;
  }

  async _deleteFormEvent() {
    if (!this.#editEventView) {
      return;
    }

    this.#editEventView.setDeleting(true);

    try {
      const editView = this.#editEventView;
      editView.setDeleting(true);

      await this.#onDelete(this.#event.id);

      if (this.#editEventView) {
        this._replaceFormWithEvent();
      }
    } catch (error) {
      if (this.#editEventView) {
        this.#editEventView.shake();
      }
    } finally {
      if (this.#editEventView) {
        this.#editEventView.setDeleting(false);
      }
    }
  }

  async _handleFormSubmit() {
    const formData = new FormData(this.#editEventView.element);
    const destinationName = formData.get('event-destination');

    const destination = this.#destinationAll.find((dest) => dest.name === destinationName);
    if (!destination) {
      this.#editEventView.shake();
      throw new Error('Нет такого пункта назначения');
    }

    const dateFrom = convertDateToISO(formData.get('event-start-time'));
    const dateTo = convertDateToISO(formData.get('event-end-time'));

    if (new Date(dateFrom) >= new Date(dateTo)) {
      this.#editEventView.shake();
      throw new Error('Конеченая дата не может быть раньше начальной');
    }

    const checkedOffers = Array.from(
      this.#editEventView.element.querySelectorAll('.event__offer-checkbox:checked')
    );

    const offersId = checkedOffers.map((input) => {
      const value = input.value;
      return isNaN(value) ? value : Number(value);
    });

    const eventType = formData.get('event-type');
    if (!POINT_TYPES.includes(eventType)) {
      this.#editEventView.shake();
    }

    const basePrice = Number(formData.get('event-price'));
    if (isNaN(basePrice) || basePrice <= 0) {
      this.#editEventView.shake();
      throw new Error('Только положительные числа');
    }

    const updatedEvent = {
      ...this.#event,
      id: this.#event.id,
      type: eventType,
      dateFrom,
      dateTo,
      basePrice,
      destination: destination.id,
      offersId,
    };

    try {
      await this.#onDataChange(updatedEvent);
      this._replaceFormWithEvent();
    } catch (error) {
      this.#editEventView.shake();
      throw error;
    }
  }
}

