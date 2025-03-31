import EventView from '../view/event-view.js';
import EditEventView from '../view/edit-event-view.js';
import { replace } from '../framework/render.js';
import { convertDateToISO } from '../utils.js';
import { USER_ACTIONS } from '../const.js';

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

  constructor({ event, destination, offer, onDataChange, destinationAll, offerAll, onFormOpen, onUserAction, onDelete }) {
    this.#event = event;
    this.#destination = destination;
    this.#offer = offer;
    this.#onDataChange = onDataChange;
    this.#destinationAll = destinationAll;
    this.#offerAll = offerAll;
    this.#onFormOpen = onFormOpen;
    this.#onUserAction = onUserAction;
    this.#onDelete = onDelete;
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
      const parent = this.#editEventView.element.parentElement;
      if (parent) {
        parent.replaceChild(this.#eventView.element, this.#editEventView.element);
      }
      this.#editEventView.removeElement();
      this.#editEventView = null;
    }
  }

  _replaceEventWithForm() {
    this.#onFormOpen();

    this.#editEventView = new EditEventView(
      this.#event,
      this.#destination,
      this.#offer,
      this.#destinationAll,
      this.#offerAll
    );

    // Устанавливаем один обработчик отправки формы
    this.#editEventView.setFormSubmitHandler((updatedEvent) => {
      this.#editEventView.setSaving(true);

      this.#onDataChange(updatedEvent)
        .then(() => {
          this.update(updatedEvent,
            this.#destinationAll.find(d => d.id === updatedEvent.destination),
            this.#offerAll.find(o => o.type === updatedEvent.type)
          );
          this._replaceFormWithEvent();
        })
        .catch(() => {
          this.#editEventView.shake();
        });
    });

    this.#editEventView.setDeleteClickHandler(() => this._deleteFormEvent());
    this.#editEventView.setEscKeyDownHandler(() => this._replaceFormWithEvent());
    this.#editEventView.setCloseButtonClickHandler(() => this._deleteFormEvent());
    this.#editEventView.setRollupButtonClickHandler(() => this._replaceFormWithEvent());

    replace(this.#editEventView, this.#eventView);
  }

  // _replaceFormWithEvent() {
  //   if (!this.#editEventView) {
  //     return;
  //   }
  //   const parent = this.#editEventView.element.parentElement;
  //   if (parent) {
  //     parent.replaceChild(this.#eventView.element, this.#editEventView.element);
  //   }
  //   this.#editEventView.removeElement();
  //   this.#editEventView = null;
  // }

  _replaceFormWithEvent() {
    if (!this.#editEventView) {
      return;
    }

    // Добавьте проверку на существование родительского элемента
    if (!this.#eventView.element.parentElement && this.#editEventView.element.parentElement) {
      this.#editEventView.element.parentElement.appendChild(this.#eventView.element);
    } else if (this.#editEventView.element.parentElement) {
      this.#editEventView.element.parentElement.replaceChild(this.#eventView.element, this.#editEventView.element);
    }

    this.#editEventView.removeElement();
    this.#editEventView = null;
  }

  async _deleteFormEvent() {
    if (!this.#editEventView) {
      console.error('Форма не инициализирована');
      return;
    }

    console.log('Удаление для события с ID', this.#event.id);
    this.#editEventView.setDeleting(true);

    try {
      // Сохраняем ссылку на форму перед удалением
      const editView = this.#editEventView;
      editView.setDeleting(true);

      await this.#onDelete(this.#event.id);

      // Проверяем, существует ли ещё форма перед обновлением
      if (this.#editEventView) {
        this._replaceFormWithEvent();
      }
    } catch (error) {
      console.error('Ошибка удаления', error);
      // Проверяем, существует ли ещё форма перед показом ошибки
      if (this.#editEventView) {
        this.#editEventView.shake();
      }
    } finally {
      // Проверяем, существует ли ещё форма перед разблокировкой
      if (this.#editEventView) {
        this.#editEventView.setDeleting(false);
      }
    }
  }

  async _handleFormSubmit() {
    console.log('!!!');
    const formData = new FormData(this.#editEventView.element);
    const destinationName = formData.get('event-destination');

    const destination = this.#destinationAll.find((dest) => dest.name === destinationName);

    if (!destination) {
      this.#editEventView.shake();
      throw new Error('Destination не найдены');
    }

    const dateFromString = formData.get('event-start-time');
    const dateToString = formData.get('event-end-time');

    const updatedEvent = {
      id: this.#event.id,
      type: formData.get('event-type'),
      dateFrom: convertDateToISO(dateFromString),
      dateTo: convertDateToISO(dateToString),
      basePrice: Number(formData.get('event-price')),
      destination: destination.id,
      offersId: Array.from(this.#editEventView.element.querySelectorAll('.event__offer-checkbox:checked'))
        .map((input) => Number(input.value)),
      favorite: this.#event.favorite,
    };

    this.#onDataChange(updatedEvent)
      .then(() => {
        this._replaceFormWithEvent();
      })
      .catch((err) => {
        console.log('Ошибка onDataChange:', err);
      });
  }
}

