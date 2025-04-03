import AbstractView from '../framework/view/abstract-view.js';
import {getDuration} from '../utils';
import dayjs from 'dayjs';

function createEventTemplate(event, destination, offer) {
  const { basePrice, type, favorite, dateFrom, dateTo, offersId } = event;
  const { offers: typeOffers } = offer || {};
  const { name = '' } = destination || {};

  const selectedOffers = typeOffers?.filter((offerItem) =>
    offersId?.includes(offerItem.id)
  ) || [];

  const getDateWithHour = (date) => dayjs(date).format('HH:mm');

  const createOffersTemplate = (offersArray) => offersArray.map((itemOffer) =>
    `
      <li class="event__offer">
        <span class="event__offer-title">${itemOffer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${itemOffer.price}</span>
      </li>
    `
  ).join('');

  return (`
    <div class="event">
      <time class="event__date" datetime="${dateFrom}">${dayjs(dateFrom).format('MMM DD')}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${type} ${name}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${dateFrom}">${getDateWithHour(dateFrom)}</time>
          &mdash;
          <time class="event__end-time" datetime="${dateTo}">${getDateWithHour(dateTo)}</time>
        </p>
        <p class="event__duration">${getDuration(dateFrom, dateTo)}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      ${selectedOffers.length > 0 ?
      `<ul class="event__selected-offers">
          ${createOffersTemplate(selectedOffers)}
        </ul>` : ''}
      <button class="event__favorite-btn ${favorite ? 'event__favorite-btn--active' : ''}" type="button">
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  `);
}

export default class EventView extends AbstractView {
  #event;
  #destination;
  #offer;

  constructor(event, destination, offer) {
    super();
    this.#event = event;
    this.#destination = destination;
    this.#offer = offer;
    this._rollupClickHandler = this._rollupClickHandler.bind(this);
    this._favoriteBtnClickHandler = this._favoriteBtnClickHandler.bind(this);
  }

  get template() {
    return createEventTemplate(this.#event, this.#destination, this.#offer);
  }

  _rollupClickHandler(evt) {
    evt.preventDefault();
    this._callback.rollupClick();
  }

  _favoriteBtnClickHandler(evt) {
    evt.preventDefault();
    this._callback.favoriteBtnClick();
  }

  setFavoriteBtnClickHandler(callback) {
    this._callback.favoriteBtnClick = callback;
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this._favoriteBtnClickHandler);
  }

  setRollupClickHandler(callback) {
    this._callback.rollupClick = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this._rollupClickHandler);
  }
}
