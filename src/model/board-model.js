import { getRandomEvent, getOffers, getDestination } from '../mock/event';

export default class BoardModel {
  constructor() {
    this.EVENT_QTY = 3;

    this.allOffers = getOffers();
    this.allDestination = getDestination();
    this.events = [];

    for (let i = 0; i < this.EVENT_QTY; i++) {
      const id = i + 1;
      this.events.push(getRandomEvent(id));
    }
  }

  getEvents() {
    return this.events;
  }

  getOffers() {
    return this.allOffers;
  }

  getOffersByType(type) {
    return this.allOffers.find((offer) => offer.type === type);
  }

  getOffersById(type, itemsId) {
    const offersType = this.getOffersByType(type);
    return offersType.offers.filter((item) => itemsId.find((id) => item.id === id));
  }

  getDestinations() {
    return this.allDestination;
  }

  getDestinationsById(id) {
    const allDestination = this.getDestinations();
    return allDestination.find((item) => item.id === id);
  }
}
