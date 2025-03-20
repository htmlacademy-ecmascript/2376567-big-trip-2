// import { createElement } from '../render.js';
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
        <!-- <button class="event__rollup-btn" type="button">
                    <span class="visually-hidden">Open event</span>
                  </button> -->
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
      description: destinations.find((destinationItem) => destinationItem.id === event.destination)?.description || '',
      pictures: destinations.find((destinationItem) => destinationItem.id === event.destination)?.pictures || [],
      destinationName: destination?.name || ''
    });

    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
    this._restoreHandlers();
  }

  get template() {
    return createAddEventTemplate(this._state);
  }

  _setDatepicker() {
    this.#datepickerStart = flatpickr(
      this.element.querySelector('#event-start-time-1'), {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        onChange: this._changeStartDateHandler
      }
    );

    this.#datepickerEnd = flatpickr(
      this.element.querySelector('#event-end-time-1'), {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onChange: this._changeEndDateHandler
      }
    );
  }

  _changeStartDateHandler = ([userDate]) => {
    this.updateElement({
      dateFrom: userDate,
    });
    this.#datepickerEnd.set('minDate', userDate);
  };

  _changeEndDateHandler = ([userDate]) => {
    this.updateElement({
      dateTo: userDate,
    });
  };

  _restoreHandlers() {
    this.setTypeChangeHandler();
    this.setDestinationChangeHandler();
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setEscKeyDownHandler(this._callback.escKeyDown);
    this.setCancelClickHandler(this._callback.closeButtonClick);
    this.setRollupButtonClickHandler(this._callback.rollupButtonClick);
    this._setDatepicker();
  }

  setTypeChangeHandler() {
    const typeList = this.element.querySelector('.event__type-list');
    if (typeList) {
      typeList.addEventListener('change', this._typeChangeHandler.bind(this));
    }
  }

  setDestinationChangeHandler() {
    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('input', this._destinationInputHandler.bind(this));
    }
  }

  _typeChangeHandler(evt) {
    const newType = evt.target.value;
    const newOffers = this.#offers.find((offersItem) => offersItem.type === newType)?.offers || [];

    this.updateElement({
      type: newType,
      offersId: [],
      offers: newOffers
    });
  }

  _destinationInputHandler(evt) {
    const destinationName = evt.target.value;
    const selectedDestination = this.#destinations.find((dest) => dest.name === destinationName);

    if (selectedDestination) {
      this.updateElement({
        destinationName: selectedDestination.name,
        description: selectedDestination.description,
        pictures: selectedDestination.pictures
      });
    }
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.element.addEventListener('submit', this._formSubmitHandler);
  }

  _formSubmitHandler = (evt) => {
    evt.preventDefault();

    const formData = new FormData(this.element);
    const destinationName = formData.get('event-destination');
    const destinationIndex = this.#destinations.findIndex((destination) => destination.name === destinationName) + 1;

    const dateFromString = formData.get('event-start-time');
    const dateToString = formData.get('event-end-time');

    const newEvent = {
      id: nanoid(),
      basePrice: Number(formData.get('event-price')),
      dateFrom: convertDateToISO(dateFromString),
      dateTo: convertDateToISO(dateToString),
      destination: destinationIndex,
      favorite: false,
      type: formData.get('event-type'),
      offersId: Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked')).map((input) => input.value),
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
      document.removeEventListener('keydown', this._escKeyDownHandler);
      this._callback.escKeyDown();
    }
  };

  _rollupButtonClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.rollupButtonClick();
  };

  setCancelClickHandler(callback) {
    this._callback.closeButtonClick = callback;
    const resetButton = this.element.querySelector('.event__reset-btn');
    resetButton.addEventListener('click', this._closeButtonClickHandler);
  }

  setRollupButtonClickHandler(callback) {
    this._callback.rollupButtonClick = callback;
    const rollupButton = this.element.querySelector('.event__rollup-btn');
    if (rollupButton) {
      rollupButton.addEventListener('click', this._rollupButtonClickHandler);
    }
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
