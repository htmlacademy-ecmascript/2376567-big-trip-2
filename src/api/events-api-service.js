/* eslint-disable camelcase */
import ApiService from '../framework/api-service';
import { convertDateToISO } from '../utils';

const Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

export default class EventsApiService extends ApiService {
  constructor(endPoint, authorization) {
    super(endPoint, authorization);
  }

  get points() {

    return this._load({ url: 'points' })
      .then(ApiService.parseResponse)
      .then((points) => points.map(this.#adaptToClient));
  }

  async updatePoint(point) {
    const adaptedPoint = this.#adaptToServer(point);

    const response = await this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(adaptedPoint),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    console.log('updatePoint', this.#adaptToClient(parsedResponse));

    return this.#adaptToClient(parsedResponse);
  }

  async addPoint(point) {
    const response = await this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return this.#adaptToClient(parsedResponse);
  }

  async deletePoint(pointId) {
    const response = await this._load({
      url: `points/${pointId}`,
      method: Method.DELETE
    });

    // Если сервер возвращает пустой ответ, не пытаемся парсить JSON
    if (response.status === 204 || response.status === 200) {
      return null;
    }

    return ApiService.parseResponse(response);
  }

  async getDestinations() {
    return this._load({ url: 'destinations' })
      .then(ApiService.parseResponse);
  }

  async getOffers() {
    return this._load({ url: 'offers' })
      .then(ApiService.parseResponse);
  }

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,
      id: point.id,
      basePrice: point.base_price,
      dateFrom: new Date(point.date_from),
      dateTo: new Date(point.date_to),
      destination: point.destination,
      favorite: point.is_favorite,
      offersId: point.offers,
      type: point.type
    };

    delete adaptedPoint.base_price;
    delete adaptedPoint.date_from;
    delete adaptedPoint.date_to;
    delete adaptedPoint.is_favorite;
    delete adaptedPoint.offers;

    return adaptedPoint;
  }

  async getDestinationById(id) {
    if (!id) {
      return null;
    }

    const destinations = await this.getDestinations();
    if (!destinations || !Array.isArray(destinations)) {
      console.error('Пункты назначения не загружены или неверный формат данных');
      return null;
    }

    return destinations.find(dest => dest.id === id);
  }

  async #adaptToServer(point) {

    const destinationObj = await this.getDestinationById(point.destination);

    const adaptedPoint = {
      ...point,
      base_price: point.basePrice,
      date_from: convertDateToISO(point.dateFrom),
      date_to: convertDateToISO(point.dateTo),
      destination: destinationObj?.id || point.destination,
      is_favorite: point.favorite,
      offers: point.offersId,
      type: point.type
    };

    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.favorite;
    delete adaptedPoint.offersId;
    delete adaptedPoint.destinationName;
    delete adaptedPoint.description;
    delete adaptedPoint.pictures;
    delete adaptedPoint.currentDestination;

    return adaptedPoint;
  }
}
