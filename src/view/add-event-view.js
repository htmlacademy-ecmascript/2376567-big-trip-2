import dayjs from 'dayjs';
import { POINT_TYPES } from '../const.js';
import AbstractView from '../framework/view/abstract-view.js';

const DATE_FORMAT = 'DD/MM/YY HH:mm';

function createAddEventTemplate(event, destination, offer, destinationAll) {
  const { basePrice, type, dateFrom, offersId } = event;
  const { name, description, pictures } = destination;

  const date = dayjs(dateFrom).format(DATE_FORMAT);

  const createOffersTemplate = (offersArray) => offersArray.map((itemOffer) =>
    `<div class="event__offer-selector">
      <input class="event__offer-checkbox visually-hidden" id="event-offer-${itemOffer.id}" type="checkbox" name="event-offer-${itemOffer.id}" ${offersId.includes(itemOffer.id) ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${itemOffer.id}">
        <span class="event__offer-title">${itemOffer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${itemOffer.price}</span>
      </label>
    </div>`
  ).join('');

  const createPicturesTemplate = (picturesArray) => picturesArray.map((picture) =>
    `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`
  ).join('');

  return (
    `<form class="event event--edit" action="#" method="post">
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
              ${POINT_TYPES.map((item) =>
      `<div class="event__type-item">
                  <input id="event-type-${item}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${item}" ${type === item ? 'checked' : ''}>
                  <label class="event__type-label event__type-label--${item}" for="event-type-${item}-1">${item}</label>
                </div>`
    ).join('')}
            </fieldset>
          </div>
        </div>
        <div class="event__field-group event__field-group--destination">
          <label class="event__label event__type-output" for="event-destination-1">
            ${type}
          </label>
          <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${name}" list="destination-list-1">
          <datalist id="destination-list-1">
            ${destinationAll.map(({ name: nameDestination }) =>
      `<option value="${nameDestination}"></option>`
    ).join('')}
          </datalist>
        </div>
        <div class="event__field-group event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${date}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${date}">
        </div>
        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
        </div>
        <button class="event__save-btn btn btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
      </header>
      <section class="event__details">
        ${offer.offers.length ?
      `<section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${createOffersTemplate(offer.offers)}
            </div>
          </section>` : ''}
        <section class="event__section event__section--destination">
          <h3 class="event__section-title event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${description}</p>
          ${pictures.length ?
      `<div class="event__photos-container">
              <div class="event__photos-tape">
                ${createPicturesTemplate(pictures)}
              </div>
            </div>` : ''}
        </section>
      </section>
    </form>`
  );
}

export default class AddEventView extends AbstractView {
  #event;
  #destination;
  #offer;
  #destinationAll;

  constructor(event, destination, offer, destinationAll) {
    super();
    this.#event = event;
    this.#destination = destination;
    this.#offer = offer;
    this.#destinationAll = destinationAll;
    this._formSubmitHandler = this._formSubmitHandler.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
    this._closeButtonClickHandler = this._closeButtonClickHandler.bind(this);
  }

  get template() {
    return createAddEventTemplate(this.#event, this.#destination, this.#offer, this.#destinationAll);
  }

  _formSubmitHandler(evt) {
    evt.preventDefault();
    this._callback.formSubmit();
  }

  _escKeyDownHandler(evt) {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this._callback.escKeyDown();
    }
  }

  _closeButtonClickHandler(evt) {
    evt.preventDefault();
    this._callback.closeButtonClick();
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.element.querySelector('.event__save-btn').addEventListener('click', this._formSubmitHandler);
  }

  setEscKeyDownHandler(callback) {
    this._callback.escKeyDown = callback;
    document.addEventListener('keydown', this._escKeyDownHandler);
  }

  setCloseButtonClickHandler(callback) {
    this._callback.closeButtonClick = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this._closeButtonClickHandler);
  }

  removeElement() {
    super.removeElement();
    document.removeEventListener('keydown', this._escKeyDownHandler);
  }
}

