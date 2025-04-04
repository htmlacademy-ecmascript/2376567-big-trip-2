import dayjs from 'dayjs';
import { POINT_TYPES } from '../const.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { convertDateToISO } from '../utils';

const DATE_FORMAT = 'DD/MM/YY HH:mm';

const createOffersTemplate = (offers, selectedOffers = []) => offers.map((offer) => `
  <div class="event__offer-selector">
    <input class="event__offer-checkbox visually-hidden"
           id="event-offer-${offer.id}"
           type="checkbox"
           name="event-offer-${offer.id}"
           value="${offer.id}"
           ${selectedOffers.includes(offer.id) ? 'checked' : ''}>
    <label class="event__offer-label" for="event-offer-${offer.id}">
      <span class="event__offer-title">${offer.title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${offer.price}</span>
    </label>
  </div>
`).join('');

const createAddEventTemplate = (state) => {
  const { type, basePrice, dateFrom, dateTo, offersId = [], offers = [],
    description = '', pictures = [], destinationName = '', destinationNames } = state;

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

export default class AddEventView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  constructor({ event, destination, offer, destinations, offers }) {
    super();
    this.#destinations = destinations || [];
    this.#offers = offers || [];

    const extractDestinationNames = this.#destinations.map((item) => item.name);
    const currentOffers = this.#offers.find((o) => o.type === event.type)?.offers || [];

    this._setState({
      ...event,
      destination: event.destination,
      offers: currentOffers,
      offersId: [],
      description: this.#destinations.find((d) => d.id === event.destination)?.description || '',
      pictures: this.#destinations.find((d) => d.id === event.destination)?.pictures || [],
      destinationName: destination?.name || '',
      destinationNames: extractDestinationNames
    });

    this._restoreHandlers();
  }

  get template() {
    return createAddEventTemplate(this._state);
  }

  setSaving(isSaving) {
    const submitButton = this.element.querySelector('.event__save-btn');
    if (submitButton) {
      submitButton.disabled = isSaving;
      submitButton.textContent = isSaving ? 'Saving...' : 'Save';
    }
  }

  _restoreHandlers() {
    this._setTypeChangeHandler();
    this._setDestinationChangeHandler();
    this._setFormSubmitHandler();
    this._setDatepicker();
    this._setDocumentHandlers();
  }

  _setTypeChangeHandler() {
    this._addConditionalListener('.event__type-list', 'change',
      (evt) => evt.target.tagName === 'INPUT',
      (evt) => {
        const newType = evt.target.value;
        const newOffers = this.#offers.find((o) => o.type === newType)?.offers || [];

        const checkedOffers = Array.from(
          this.element.querySelectorAll('.event__offer-checkbox:checked')
        ).map((input) => input.value);

        this._setState({
          type: newType,
          offersId: checkedOffers.filter((id) =>
            newOffers.some((offer) => offer.id === id)
          ),
          offers: newOffers
        });

        this._updateElementText('.event__type-output', newType);
        this._updateElementAttribute('.event__type-icon', 'src', `img/icons/${newType}.png`);
        const offersContainer = this.element.querySelector('.event__available-offers');
        if (offersContainer) {
          offersContainer.innerHTML = createOffersTemplate(newOffers, this._state.offersId);
        }
        this._toggleElementVisibility(
          '.event__section--offers',
          newOffers.length > 0
        );

        this._closeTypeDropdown();
      }
    );
  }

  _setDestinationChangeHandler() {
    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('input', (evt) => {
        this._handleDestinationInput(evt.target.value);
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
      this._hideError();
    }
  }

  _updateDestinationDetails(destination) {
    this._updateElementText('.event__destination-description', destination.description || '');
    this._updateElementHTML(
      '.event__photos-tape',
      destination.pictures?.map((p) => `<img class="event__photo" src="${p.src}" alt="${p.description}">`).join('') || ''
    );
    this._toggleElementVisibility(
      '.event__section--destination',
      !!destination.description || !!destination.pictures?.length
    );
  }

  _setDatepicker() {
    this._destroyDatepickers();

    this.#datepickerStart = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        onChange: (selectedDates) => {
          this.#datepickerStart?.close();
          this._setState({ dateFrom: selectedDates[0] });
          this.#datepickerEnd?.set('minDate', selectedDates[0]);
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
        onChange: (selectedDates) => {
          this.#datepickerEnd?.close();
          this._setState({ dateTo: selectedDates[0] });
        }
      }
    );
  }

  _setDocumentHandlers() {
    document.addEventListener('click', (evt) => {
      if (!this.element.contains(evt.target)) {
        this._closeDatepickers();
      }
    });

    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape') {
        this._closeDatepickers();
      }
    });
  }

  _closeDatepickers() {
    [this.#datepickerStart, this.#datepickerEnd].forEach((picker) => picker?.close());
  }

  _destroyDatepickers() {
    [this.#datepickerStart, this.#datepickerEnd].forEach((picker) => picker?.destroy());
  }

  _setFormSubmitHandler() {
    this.element.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this._handleFormSubmit();
    });
  }

  _handleFormSubmit() {
    const formData = new FormData(this.element);
    const destinationName = formData.get('event-destination');
    const destination = this.#destinations.find((d) => d.name === destinationName);
    const checkedOffers = Array.from(
      this.element.querySelectorAll('.event__offer-checkbox:checked')
    );

    if (!destinationName) {
      this.shake();
      return;
    }

    const offersId = checkedOffers.map((input) => {
      const value = input.value;
      return value && !isNaN(value) ? Number(value) : value;
    });

    const dateFrom = convertDateToISO(formData.get('event-start-time'));
    const dateTo = convertDateToISO(formData.get('event-end-time'));

    if (new Date(dateFrom) >= new Date(dateTo)) {
      this.shake();
      return;
    }

    const basePrice = Number(formData.get('event-price'));
    if (isNaN(basePrice) || basePrice <= 0) {
      this.shake();
      return;
    }

    const newEvent = {
      id: null,
      basePrice,
      dateFrom,
      dateTo,
      destination: destination.id,
      favorite: false,
      type: formData.get('event-type'),
      offersId,
    };

    this._callback.formSubmit?.(newEvent);
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
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

  setCancelClickHandler(callback) {
    this._callback.closeButtonClick = callback;
    const button = this.element.querySelector('.event__reset-btn');
    if (button) {
      button.addEventListener('click', (evt) => {
        evt.preventDefault();
        this._callback.closeButtonClick?.();
      });
    }
  }

  _hideError() {
    this._updateElementStyle('.event__error', 'display', 'none');
  }

  shake() {
    this.element.style.animation = 'shake 0.5s';
    setTimeout(() => {
      this.element.style.animation = '';
    }, 500);
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

  _updateElementStyle(selector, property, value) {
    const element = this.element.querySelector(selector);
    if (element) {
      element.style[property] = value;
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
}
