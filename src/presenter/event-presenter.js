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

  _replaceEventWithForm() {
    // Уведомляем внешние компоненты об открытии формы
    this.#onFormOpen();

    // Получаем ссылку на родительский li-элемент
    const listItem = this.#eventView.element.closest('li.trip-events__item');
    if (!listItem) {
      console.log('Не найден родительский li элемент для события');
      return;
    }

    // Создаем новую форму редактирования
    this.#editEventView = new EditEventView(
      this.#event,
      this.#destination,
      this.#offer,
      this.#destinationAll,
      this.#offerAll
    );

    // Обработчик отправки формы
    this.#editEventView.setFormSubmitHandler((updatedEvent) => {
      this.#editEventView.setSaving(true);

      this.#onDataChange(updatedEvent)
        .then(() => {
          // После успешного обновления:
          // 1. Обновляем данные в презентере
          // 2. Возвращаем карточку события
          this.update(
            updatedEvent,
            this.#destinationAll.find((d) => d.id === updatedEvent.destination),
            this.#offerAll.find((o) => o.type === updatedEvent.type)
          );
          this._replaceFormWithEvent();
        })
        .catch(() => {
          this.#editEventView.shake();
        });
    });

    // Установка обработчиков:
    this.#editEventView.setDeleteClickHandler(() => this._deleteFormEvent());
    this.#editEventView.setEscKeyDownHandler(() => this._replaceFormWithEvent());
    this.#editEventView.setCloseButtonClickHandler(() => this._deleteFormEvent());
    this.#editEventView.setRollupButtonClickHandler(() => this._replaceFormWithEvent());

    // Заменяем содержимое li-элемента: карточку на форму
    listItem.innerHTML = ''; // Очищаем li
    listItem.appendChild(this.#editEventView.element); // Добавляем форму
  }

  /**
   * Заменяет форму редактирования обратно на карточку события
   * Работает через родительский li-элемент для надежности
   */
  _replaceFormWithEvent() {
    if (!this.#editEventView) {
      return;
    }

    // Находим родительский li-элемент
    const listItem = this.#editEventView.element.closest('li.trip-events__item');
    if (!listItem) {
      console.log('Не найден родительский li элемент для формы редактирования');
      return;
    }

    // Заменяем содержимое li-элемента: форму на карточку
    listItem.innerHTML = ''; // Очищаем li
    listItem.appendChild(this.#eventView.element); // Добавляем карточку события

    // Удаляем форму
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
      console.log('Ошибка удаления', error);
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
      console.log('Ошибка сохранания', error);
      throw error;
    }
  }
}

