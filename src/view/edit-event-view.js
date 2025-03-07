import { createElement } from '../render.js';
import dayjs from 'dayjs';
import { POINT_TYPES } from '../const.js';

function createEditEventTemplate(event, destination, offer, destinationAll) {
  const { basePrice, type, dateFrom, dateTo, offersId } = event;
  const { name, description, pictures } = destination;

  const createOffersTemplate = (offersArray) => offersArray.map((itemOffer) =>
    `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden" id="event-offer-${itemOffer.id}" type="checkbox" name="event-offer-${itemOffer.id}" ${offersId.includes(itemOffer.id) ? 'checked' : ''}>
        <label class="event__offer-label" for="event-offer-${itemOffer.id}">
          <span class="event__offer-title">${itemOffer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${itemOffer.price}</span>
        </label>
      </div>
    `).join('');

  const createPicturesTemplate = (picturesArray) => picturesArray.map((picture) =>
    `
      <img class="event__photo" src="${picture.src}" alt="${picture.description}">
    `).join('');

  return (
    `<form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${POINT_TYPES.map((item) => `
                <div class="event__type-item">
                  <input id="event-type-${item}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${item}" ${type === item ? 'checked' : ''}>
                  <label class="event__type-label  event__type-label--${item}" for="event-type-${item}-1">${item}</label>
                </div>
              `).join('')}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">
            ${type}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${name}" list="destination-list-1">
          <datalist id="destination-list-1">
            ${destinationAll.map(({ name: nameDestination }) => `<option value="${nameDestination}"></option>`).join('')}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dayjs(dateFrom).format('DD/MM/YY HH:mm')}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dayjs(dateTo).format('DD/MM/YY HH:mm')}">
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Delete</button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>
      <section class="event__details">
        ${offer.offers.length ? `
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${createOffersTemplate(offer.offers)}
            </div>
          </section>
        ` : ''}

        <section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
          <p class="event__destination-description">${description}</p>
          ${pictures.length ? `
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${createPicturesTemplate(pictures)}
              </div>
            </div>
          ` : ''}
        </section>
      </section>
    </form>`
  );
}

export default class EditEventView {
  constructor(event, destination, offer, destinationAll) {
    this.event = event;
    this.destination = destination;
    this.offer = offer;
    this.destinationAll = destinationAll;
  }

  getTemplate() {
    return createEditEventTemplate(this.event, this.destination, this.offer, this.destinationAll);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
