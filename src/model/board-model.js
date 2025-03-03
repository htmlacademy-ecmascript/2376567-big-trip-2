import { getRandomEvent, getOffers, getDestination } from '../mock/event';

export default class BoardModel {
  #events = [];
  #allOffers = getOffers();
  #allDestinations = getDestination();
  EVENT_QTY = 10;

  constructor() {
    for (let i = 0; i < this.EVENT_QTY; i++) {
      const id = i + 1;
      this.#events.push(getRandomEvent(id));
    }
  }

  get events() {
    return this.#events;
  }

  get offers() {
    return this.#allOffers;
  }

  get destinations() {
    return this.#allDestinations;
  }

  getDestinationsById(id) {
    const allDestinations = this.destinations;
    return allDestinations.find((item) => item.id === id);
  }

  getOffersByType(type) {
    return this.#allOffers.find((offer) => offer.type === type);
  }

  getOffersById(type, itemsId) {
    const offersType = this.getOffersByType(type);
    return offersType.offers.filter((item) => itemsId.find((id) => item.id === id));
  }
}
