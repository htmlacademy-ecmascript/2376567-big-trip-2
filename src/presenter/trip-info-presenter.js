import { formatDatesRange } from '../utils.js';
import { SORT_TYPES } from '../const.js';

export default class TripInfoPresenter {
  #boardModel = null;
  #container = null;
  #uiBlocker = null;

  constructor({ container, boardModel, uiBlocker }) {
    this.#container = container;
    this.#boardModel = boardModel;
    this.#uiBlocker = uiBlocker;
    this.#boardModel.addObserver(this._handleModelChange.bind(this));
  }

  async init() {
    await this.#boardModel.ready;
    this._updateTripInfo();

  }

  _updateTripInfo() {
    const sortedEvents = this.#boardModel.getSortedEvents(this.#boardModel.events, SORT_TYPES.DAY);
    const tripInfo = this._calculateTripInfo(sortedEvents);

    const titleElement = this.#container.querySelector('.trip-info__title');
    const datesElement = this.#container.querySelector('.trip-info__dates');
    const costElement = this.#container.querySelector('.trip-info__cost-value');


    if (titleElement) {
      titleElement.textContent = tripInfo.title;
    }
    if (datesElement) {
      datesElement.textContent = tripInfo.dates;
    }
    if (costElement) {
      costElement.textContent = tripInfo.cost;
    }
  }

  _calculateTripInfo(events) {
    if (!events?.length) {
      return { title: '', dates: '', cost: '0' };
    }

    return {
      title: this._formatRouteTitle(events),
      dates: formatDatesRange(events[0].dateFrom, events[events.length - 1].dateTo),
      cost: this._calculateTotalCost(events).toString()
    };
  }

  _calculateTotalCost(events) {
    if (!events?.length) {
      return 0;
    }

    return events.reduce((total, event) => {
      try {
        const basePrice = Number(event.basePrice) || 0;

        const selectedOfferIds = event.offersId || [];

        if (!selectedOfferIds.length) {
          return total + basePrice;
        }

        const offerType = this.#boardModel.getOffersByType(event.type);

        if (!offerType?.offers?.length) {
          return total + basePrice;
        }

        const offersCost = offerType.offers
          .filter((offer) => selectedOfferIds.includes(offer.id))
          .reduce((sum, offer) => sum + (Number(offer.price) || 0), 0);

        return total + basePrice + offersCost;
      } catch (error) {
        return total;
      }
    }, 0);
  }

  _formatRouteTitle(events) {
    const destinations = events
      .map((event) => this.#boardModel.getDestinationsById(event.destination)?.name)
      .filter(Boolean);
    if (!destinations.length) {
      return '';
    }

    const uniqueDestinations = [...new Set(destinations)];
    return uniqueDestinations.length <= 3
      ? uniqueDestinations.join(' — ')
      : `${uniqueDestinations[0]} — ... — ${uniqueDestinations.at(-1)}`;
  }

  _handleModelChange() {
    this._updateTripInfo();
  }
}
