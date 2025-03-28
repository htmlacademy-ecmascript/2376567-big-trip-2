import dayjs from 'dayjs';
import { POINT_TYPES, DESTINATIONS } from '../const.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { nanoid } from 'nanoid';
import { convertDateToISO } from '../utils';

const DATE_FORMAT = 'DD/MM/YY HH:mm';

function createAddEventTemplate(state) {
  const { type, basePrice, dateFrom, dateTo, offersId, offers, description, pictures, destinationName } = state;

  const currentDestination = destinationName || '';
  const currentOffers = offers || [];
  const currentPictures = pictures || [];

  return `
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${POINT_TYPES.map((item) => `
                <div class="event__type-item">
                  <input id="event-type-${item}-1" class="event__type-input visually-hidden"
                         type="radio" name="event-type" value="${item}"
                         ${type === item ? 'checked' : ''}>
                  <label class="event__type-label event__type-label--${item}"
                         for="event-type-${item}-1">${item}</label>
                </div>
              `).join('')}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group event__field-group--destination">
          <label class="event__label event__type-output" for="event-destination-1">${type}</label>
          <input class="event__input event__input--destination" id="event-destination-1"
                 type="text" name="event-destination" value="${currentDestination}" placeholder=""
                 list="destination-list-1">
          <datalist id="destination-list-1">
            ${DESTINATIONS.map((dest) => `<option value="${dest}"></option>`).join('')}
          </datalist>
          <div class="event__error" style="display: none;"></div>
        </div>

        <div class="event__field-group event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input event__input--time" id="event-start-time-1"
                 type="text" name="event-start-time" value="${dayjs(dateFrom).format(DATE_FORMAT)}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input event__input--time" id="event-end-time-1"
                 type="text" name="event-end-time" value="${dayjs(dateTo).format(DATE_FORMAT)}">
        </div>

        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input event__input--price" id="event-price-1"
                 type="text" name="event-price" value="${basePrice}">
        </div>

        <button class="event__save-btn btn btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
      </header>

      <section class="event__details">
        ${currentOffers.length ? `
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${currentOffers.map((offer) => `
                <div class="event__offer-selector">
                  <input class="event__offer-checkbox visually-hidden"
                         id="event-offer-${offer.id}"
                         type="checkbox"
                         name="event-offer-${offer.id}"
                         ${offersId.includes(offer.id) ? 'checked' : ''}>
                  <label class="event__offer-label" for="event-offer-${offer.id}">
                    <span class="event__offer-title">${offer.title}</span>
                    &plus;&euro;&nbsp;
                    <span class="event__offer-price">${offer.price}</span>
                  </label>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${description || ''}</p>
          ${currentPictures.length ? `
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${currentPictures.map((photo) => `
                  <img class="event__photo" src="${photo.src}" alt="${photo.description}">
                `).join('')}
              </div>
            </div>
          ` : ''}
        </section>
      </section>
    </form>
  `;
}

export default class AddEventView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  constructor({ event, destination, offer, destinations, offers }) {
    super();
    this.#destinations = destinations || [];
    this.#offers = offers || [];

    this._setState({
      ...event,
      destination: event.destination,
      offers: offer?.offers || [],
      description: destinations.find((d) => d.id === event.destination)?.description || '',
      pictures: destinations.find((d) => d.id === event.destination)?.pictures || [],
      destinationName: destination?.name || ''
    });

    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
    this._restoreHandlers();
  }

  get template() {
    return createAddEventTemplate(this._state);
  }

  _setDatepicker() {
    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
    }
    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
    }

    this.#datepickerStart = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        onChange: this._changeStartDateHandler,
        onClose: () => this._updateFormLayout()
      }
    );

    this.#datepickerEnd = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onChange: this._changeEndDateHandler,
        onClose: () => this._updateFormLayout()
      }
    );
  }

  _changeStartDateHandler = (selectedDates, dateStr, instance) => {
    const oldDate = this._state.dateFrom;
    const newDate = selectedDates[0];
    const dateChanged = !this._isSameDate(oldDate, newDate);

    if (dateChanged) {
      instance.close();
    }

    this._setState({
      dateFrom: newDate
    }, false);

    if (this.#datepickerEnd) {
      this.#datepickerEnd.set('minDate', newDate);
    }
  };

  _changeEndDateHandler = (selectedDates, dateStr, instance) => {
    const oldDate = this._state.dateTo;
    const newDate = selectedDates[0];
    const dateChanged = !this._isSameDate(oldDate, newDate);

    if (dateChanged) {
      instance.close();
    }

    this._setState({
      dateTo: newDate
    }, false);
  };

  _isSameDate = (date1, date2) => {
    if (!date1 || !date2) {
      return false;
    }
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  _restoreHandlers() {
    this.setTypeChangeHandler();
    this.setDestinationChangeHandler();
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setEscKeyDownHandler(this._callback.escKeyDown);
    this.setCancelClickHandler(this._callback.closeButtonClick);
    this._setDatepicker();

    // Закрытие datepicker при клике вне
    document.addEventListener('click', (evt) => {
      if (!this.element.contains(evt.target)) {
        this.closeDatepickers();
      }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape') {
        this.closeDatepickers();
      }
    });
  }

  closeDatepickers() {
    if (this.#datepickerStart) {
      this.#datepickerStart.close();
    }
    if (this.#datepickerEnd) {
      this.#datepickerEnd.close();
    }
  }

  _updateFormLayout() {
    // Дополнительные обновления layout при необходимости
  }

  setTypeChangeHandler() {
    const typeList = this.element.querySelector('.event__type-list');
    if (typeList) {
      typeList.addEventListener('change', (evt) => {
        if (evt.target.tagName === 'INPUT') {
          this._typeChangeHandler(evt);
          this._closeTypeDropdown();
        }
      });
    }
  }

  _typeChangeHandler(evt) {
    const newType = evt.target.value;
    const newOffers = this.#offers.find((offer) => offer.type === newType)?.offers || [];

    this._closeTypeDropdown();

    this._setState({
      type: newType,
      offersId: [],
      offers: newOffers
    }, false);

    this._updateOffersSection(newOffers);
    this._updateTypeIcon(newType);
    this._updateTypeOutput(newType);
  }

  _closeTypeDropdown() {
    const typeToggle = this.element.querySelector('.event__type-toggle');
    if (typeToggle) {
      typeToggle.checked = false;
    }
  }

  _updateTypeOutput(type) {
    const typeOutput = this.element.querySelector('.event__type-output');
    if (typeOutput) {
      typeOutput.textContent = type;
    }
  }

  setDestinationChangeHandler() {
    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('input', (evt) => {
        this._destinationInputHandler(evt);
      });
    }
  }

  _destinationInputHandler(evt) {
    const destinationName = evt.target.value;

    // Сбрасываем состояние если поле пустое
    if (!destinationName.trim()) {
      this._updateDestinationDetails({
        description: '',
        pictures: []
      });
      return;
    }

    const selectedDestination = this.#destinations.find((dest) =>
      dest.name.toLowerCase().includes(destinationName.toLowerCase())
    );

    if (selectedDestination) {
      this._updateDestinationDetails(selectedDestination);
      this._setState({
        destinationName: selectedDestination.name,
        destination: selectedDestination.id,
        description: selectedDestination.description,
        pictures: selectedDestination.pictures
      }, false);
      this.hideError();
    } else {
      // this.showError('Please select a destination from the list');
    }
  }

  _updateDestinationDetails(destination) {
    // Обновляем описание
    const descriptionElement = this.element.querySelector('.event__destination-description');
    if (descriptionElement) {
      descriptionElement.textContent = destination.description || '';
    }

    // Обновляем фотографии
    const photosContainer = this.element.querySelector('.event__photos-tape');
    if (photosContainer) {
      photosContainer.innerHTML = destination.pictures ? destination.pictures.map(photo => `
        <img class="event__photo" src="${photo.src}" alt="${photo.description}">
      `).join('') : '';
    }

    // Обновляем видимость секции
    const destinationSection = this.element.querySelector('.event__section--destination');
    if (destinationSection) {
      destinationSection.style.display = destination.description || destination.pictures?.length ? 'block' : 'none';
    }
  }

  showError(message) {
    const errorElement = this.element.querySelector('.event__error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  hideError() {
    const errorElement = this.element.querySelector('.event__error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  shake() {
    this.element.style.animation = 'shake 0.5s';
    setTimeout(() => {
      this.element.style.animation = '';
    }, 500);
  }

  _updateOffersSection(offers) {
    const offersContainer = this.element.querySelector('.event__available-offers');
    if (offersContainer) {
      offersContainer.innerHTML = this._createOffersTemplate(offers);
    }
  }

  _updateTypeIcon(type) {
    const icon = this.element.querySelector('.event__type-icon');
    if (icon) {
      icon.src = `img/icons/${type}.png`;
    }
  }

  _createOffersTemplate(offers) {
    return offers.map((offer) => `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden"
               id="event-offer-${offer.id}"
               type="checkbox"
               name="event-offer-${offer.id}">
        <label class="event__offer-label" for="event-offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `).join('');
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.element.addEventListener('submit', this._formSubmitHandler);
  }

  _formSubmitHandler = (evt) => {
    evt.preventDefault();

    const formData = new FormData(this.element);
    const destinationName = formData.get('event-destination');
    const destination = this.#destinations.find(d => d.name === destinationName);

    if (!destination) {
      this.shake();
      // this.showError('Please select a valid destination from the list');
      return;
    }

    const dateFromString = formData.get('event-start-time');
    const dateToString = formData.get('event-end-time');

    const newEvent = {
      id: nanoid(),
      basePrice: Number(formData.get('event-price')),
      dateFrom: convertDateToISO(dateFromString),
      dateTo: convertDateToISO(dateToString),
      destination: destination.id,
      favorite: false,
      type: formData.get('event-type'),
      offersId: Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'))
        .map((input) => input.value),
    };

    this._callback.formSubmit(newEvent);
  };

  setEscKeyDownHandler(callback) {
    this._callback.escKeyDown = callback;
    document.addEventListener('keydown', this._escKeyDownHandler);
  }

  _escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this._callback.escKeyDown();
    }
  };

  setCancelClickHandler(callback) {
    this._callback.closeButtonClick = callback;
    const resetButton = this.element.querySelector('.event__reset-btn');
    resetButton.addEventListener('click', this._closeButtonClickHandler);
  }

  _closeButtonClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.closeButtonClick();
  };

  removeElement() {
    super.removeElement();

    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }

    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  }
}
