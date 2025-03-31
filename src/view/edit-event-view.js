import dayjs from 'dayjs';
import { POINT_TYPES, DESTINATIONS } from '../const.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { convertDateToISO } from '../utils.js';

const DATE_FORMAT = 'DD/MM/YY HH:mm';

const createOffersTemplate = (offers, selectedOffers = []) => offers.map((offer) => `
  <div class="event__offer-selector">
    <input class="event__offer-checkbox visually-hidden"
           id="event-offer-${offer.id}"
           type="checkbox"
           name="event-offer-${offer.id}"
           ${selectedOffers.includes(offer.id) ? 'checked' : ''}>
    <label class="event__offer-label" for="event-offer-${offer.id}">
      <span class="event__offer-title">${offer.title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${offer.price}</span>
    </label>
  </div>
`).join('');

const createEditEventTemplate = (state) => {
  const {
    type,
    basePrice,
    dateFrom,
    dateTo,
    offersId = [],
    offers = [],
    description,
    pictures,
    destinationName,
    destinationNames
  } = state;

  const renderSectionIf = (condition, content) => condition ? content : '';

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
                 type="text" name="event-destination" value="${destinationName}"
                 list="destination-list-1">
          <datalist id="destination-list-1">
            ${destinationNames.map((dest) => `<option value="${dest}"></option>`).join('')}
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
        <button class="event__reset-btn" type="reset">Delete</button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>

      <section class="event__details">
        ${renderSectionIf(offers.length, `
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${createOffersTemplate(offers, offersId)}
            </div>
          </section>
        `)}

        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${description}</p>
          ${renderSectionIf(pictures.length, `
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${pictures.map((photo) => `
                  <img class="event__photo" src="${photo.src}" alt="${photo.description}">
                `).join('')}
              </div>
            </div>
          `)}
        </section>
      </section>
    </form>
  `;
};

export default class EditEventView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  constructor(event, destination, offer, destinations, offers) {
    super();
    this.#destinations = destinations;
    this.#offers = offers;

    const selectedDestination = this.#destinations.find(d => d.id === event.destination) || {};
    const extractDestinationNames = this.#destinations.map(item => item.name);

    this._setState({
      ...event,
      destination: event.destination,
      offers: offers.find((o) => o.type === event.type)?.offers || [],
      description: selectedDestination.description || '',
      pictures: selectedDestination.pictures || [],
      destinationName: selectedDestination.name || '',
      currentDestination: selectedDestination,
      destinationNames: extractDestinationNames,
    });

    this._restoreHandlers();
  }

  get template() {
    return createEditEventTemplate(this._state);
  }

  setSaving(isSaving) {
    const submitButton = this.element.querySelector('.event__save-btn');
    if (submitButton) {
      submitButton.disabled = isSaving;
      submitButton.textContent = isSaving ? 'Saving...' : 'Save';
    }
  }

  setDeleting(isDeleting) {
    const deleteButton = this.element.querySelector('.event__reset-btn');
    if (deleteButton) {
      deleteButton.disabled = isDeleting;
      deleteButton.textContent = isDeleting ? 'Deleting...' : 'Delete';
    }
  }

  // _handleFormSubmit() {
  //   console.log('!!!');
  //   const formData = new FormData(this.element);
  //   const destinationName = formData.get('event-destination');
  //   const destination = this.#destinations.find((d) => d.name === destinationName);

  //   if (!destination) {
  //     this.shake();
  //     return;
  //   }

  //   if (!formData.get('event-start-time') || !formData.get('event-end-time')) {
  //     this.shake();
  //     return;
  //   }

  //   const updatedEvent = {
  //     id: this._state.id, // Сохраняем оригинальный ID
  //     basePrice: Number(formData.get('event-price')),
  //     dateFrom: convertDateToISO(formData.get('event-start-time')),
  //     dateTo: convertDateToISO(formData.get('event-end-time')),
  //     destination: destination.id,
  //     favorite: this._state.favorite, // Сохраняем оригинальное значение
  //     type: formData.get('event-type'),
  //     offersId: Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'))
  //       .map((input) => input.value),
  //   };

  //   console.log('Submitting event:', updatedEvent);
  //   this._callback.formSubmit?.(updatedEvent); // Вызываем колбэк с обновленными данными
  // }

  _handleFormSubmit() {
    console.log('!!!');
    const formData = new FormData(this.element);

    const destinationName = formData.get('event-destination');
    const destination = this.#destinations.find((d) => d.name === destinationName);

    if (!destination) {
      console.error('Destination not found');
      this.shake();
      return;
    }

    const type = formData.get('event-type');
    const validTypes = ['taxi', 'bus', 'train', 'flight', 'check-in', 'sightseeing', 'ship', 'drive', 'restaurant'];

    if (!validTypes.includes(type)) {
      console.error('Invalid event type');
      this.shake();
      return;
    }

    const basePrice = Number(formData.get('event-price'));
    if (isNaN(basePrice) || basePrice < 1 || basePrice > 100000) {
      console.error('Invalid base price');
      this.shake();
      return;
    }

    const dateFrom = convertDateToISO(formData.get('event-start-time'));
    const dateTo = convertDateToISO(formData.get('event-end-time'));

    if (!dateFrom || !dateTo || new Date(dateFrom) >= new Date(dateTo)) {
      console.error('Invalid date range');
      this.shake();
      return;
    }

    const offersId = Array.from(
      this.element.querySelectorAll('.event__offer-checkbox:checked')
    ).map((input) => input.value);

    if (offersId.length === 0) {
      console.error('No offers selected');
      this.shake();
      return;
    }

    const updatedEvent = {
      id: this._state.id,
      basePrice,
      dateFrom,
      dateTo,
      destination: destination.id,
      favorite: Boolean(this._state.favorite),
      type,
      offersId,
    };

    console.log('Submitting event:', updatedEvent);
    this._callback.formSubmit?.(updatedEvent);
  }

  _restoreHandlers() {
    this._setTypeChangeHandler();
    this._setDestinationChangeHandler();
    this._setFormSubmitHandler();
    this._setDatepicker();
  }

  _setTypeChangeHandler() {
    this._addConditionalListener('.event__type-list', 'change',
      (evt) => evt.target.tagName === 'INPUT',
      (evt) => {
        const newType = evt.target.value;
        const newOffers = this.#offers.find((o) => o.type === newType)?.offers || [];

        this._setState({
          type: newType,
          offersId: [],
          offers: newOffers
        });

        this._updateElementText('.event__type-output', newType);
        this._updateElementAttribute('.event__type-icon', 'src', `img/icons/${newType}.png`);
        this._closeTypeDropdown();
      }
    );
  }

  _setDestinationChangeHandler() {
    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      let timeout;
      destinationInput.addEventListener('input', (evt) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this._handleDestinationInput(evt.target.value), 300);
      });
    }
  }

  _handleDestinationInput(destinationName) {
    if (!destinationName.trim()) {
      return this._updateDestinationDetails({ description: '', pictures: [] });
    }

    const selectedDestination = this.#destinations.find((d) =>
      d.name.toLowerCase().includes(destinationName.toLowerCase())
    );

    if (selectedDestination) {
      this._updateDestinationDetails(selectedDestination);
      this._setState({
        destinationName: selectedDestination.name,
        destination: selectedDestination.id,
        description: selectedDestination.description,
        pictures: selectedDestination.pictures
      });
    }
  }

  _updateDestinationDetails(destination) {
    this._updateElementText('.event__destination-description', destination.description || '');
    this._updateElementHTML(
      '.event__photos-tape',
      destination.pictures?.map((p) => `<img class="event__photo" src="${p.src}" alt="${p.description}">`).join('') || ''
    );
    this._toggleElementVisibility('.event__section--destination', !!destination.description);
  }

  _setDatepicker() {
    this._destroyDatepickers();

    this.#datepickerStart = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        onChange: ([date]) => {
          this.#datepickerStart?.close();
          this._setState({ dateFrom: date });
          this.#datepickerEnd?.set('minDate', date);
        }
      }
    );

    this.#datepickerEnd = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onChange: ([date]) => {
          this.#datepickerEnd?.close();
          this._setState({ dateTo: date });
        }
      }
    );
  }

  _destroyDatepickers() {
    [this.#datepickerStart, this.#datepickerEnd].forEach((picker) => picker?.destroy());
  }

  _setFormSubmitHandler() {
    this.element.addEventListener('submit', (evt) => {
      console.log('Form submit event triggered');
      evt.preventDefault();
      this._handleFormSubmit(); // Вызываем _handleFormSubmit вместо this._callback.formSubmit
    });
  }

  setCloseButtonClickHandler() {
    const deleteButton = this.element.querySelector('.event__reset-btn');
    if (deleteButton) {
      deleteButton.addEventListener('click', (evt) => {
        evt.preventDefault();
        if (typeof this._callback.deleteClick === 'function') {
          this._callback.deleteClick();
        } else {
          console.error('ошибка setCloseButtonClickHandler');
        }
      });
    }
  }

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;
  }

  setRollupButtonClickHandler(callback) {
    this._callback.rollupButtonClick = callback;
    const button = this.element.querySelector('.event__rollup-btn');
    if (button) {
      button.addEventListener('click', (evt) => {
        evt.preventDefault();
        this._callback.rollupButtonClick?.();
      });
    }
  }

  _closeTypeDropdown() {
    const typeToggle = this.element.querySelector('.event__type-toggle');
    if (typeToggle) {
      typeToggle.checked = false;
    }
  }

  _addConditionalListener(selector, event, condition, handler) {
    const element = this.element.querySelector(selector);
    if (element) {
      element.addEventListener(event, (evt) => condition(evt) && handler(evt));
    }
  }

  _updateElementText(selector, text) {
    const element = this.element.querySelector(selector);
    if (element) {
      element.textContent = text;
    }
  }

  _updateElementAttribute(selector, attr, value) {
    const element = this.element.querySelector(selector);
    if (element) {
      element[attr] = value;
    }
  }

  _updateElementHTML(selector, html) {
    const element = this.element.querySelector(selector);
    if (element) {
      element.innerHTML = html;
    }
  }

  _toggleElementVisibility(selector, isVisible) {
    const element = this.element.querySelector(selector);
    if (element) {
      element.style.display = isVisible ? 'block' : 'none';
    }
  }

  removeElement() {
    super.removeElement();
    this._destroyDatepickers();
  }

  shake() {
    this.element.style.animation = 'shake 0.5s';
    setTimeout(() => {
      this.element.style.animation = '';
    }, 500);
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    // console.log(this._callback.formSubmit);
  }

  setEscKeyDownHandler(callback) {
    this._callback.escKeyDown = callback;
    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        this._callback.escKeyDown?.();
      }
    });
  }
}
