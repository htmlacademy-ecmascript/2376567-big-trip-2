import { getRandomInt, returnRandomElem, getRandomUniqueInt } from '../utils';
import { POINT_TYPES } from '../const.js';

const BasePriceRange = { MIN: 10, MAX: 3000 };
const DateRange = { MIN: -365, MAX: 365 };
const OfferPriceRange = { MIN: 20, MAX: 200 };
const PhotoIdRange = { MIN: 1, MAX: 100 };
const PHOTO_URL = 'https://loremflickr.com/248/152?random=';

const getOffers = () => {
  const MAX_OFFERS_QTY = 3;
  const offersMocks = [];
  let counter = 1;

  const getRandomOffers = (id) => ({
    title: `Offer's title ${counter++}`,
    price: getRandomInt(OfferPriceRange.MIN, OfferPriceRange.MAX),
    id,
  });

  for (let i = 0; i < POINT_TYPES.length; i++) {
    const uniqueIds = Array.from({ length: getRandomInt(1, MAX_OFFERS_QTY) }, (_, index) => index + 1);
    const arr = {
      type: POINT_TYPES[i],
      offers: uniqueIds.map((id) => getRandomOffers(id)),
    };
    offersMocks.push(arr);
  }

  return offersMocks;
};

const getDestination = () => {
  const MAX_PHOTO_QTY = 5;
  const CITIES = ['Amsterdam', 'Chamonix', 'Geneva', 'Paris', 'Berlin', 'Prague', 'Tokyo', 'Moscow', 'Saint-Petersburg'];
  const DESCRIPTION = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Cras aliquet varius magna, non porta ligula feugiat eget.',
    'Fusce tristique felis at fermentum pharetra.',
    'Aliquam id orci ut lectus varius viverra.',
    'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.',
    'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.',
    'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.',
    'Sed sed nisi sed augue convallis suscipit in sed felis.',
    'Aliquam erat volutpat.',
    'Nunc fermentum tortor ac porta dapibus.',
    'In rutrum ac purus sit amet tempus.'
  ];

  const destinationMocks = [];
  const getRandomPhoto = () => ({
    src: `${PHOTO_URL}${getRandomInt(PhotoIdRange.MIN, PhotoIdRange.MAX)}`,
    description: 'Random photo',
  });

  for (let i = 0; i < CITIES.length; i++) {
    const arr = {
      id: i + 1,
      description: returnRandomElem(DESCRIPTION),
      name: CITIES[i],
      pictures: Array.from({ length: getRandomInt(0, MAX_PHOTO_QTY) }, getRandomPhoto),
    };
    destinationMocks.push(arr);
  }

  return destinationMocks;
};

const getRandomEvent = (quantity) => {
  const mockOffersArray = getOffers();
  const mockDestinationArray = getDestination();
  const offersElement = returnRandomElem(mockOffersArray);
  const destinationElement = returnRandomElem(mockDestinationArray);
  const { type, offers } = offersElement;
  const offersIdType = offers.map((item) => item.id);
  const offersId = offersIdType.slice(0, getRandomInt(1, offers.length));
  const idEvent = getRandomUniqueInt(1, quantity);

  const randomDaysOffset = getRandomInt(DateRange.MIN, DateRange.MAX);
  const now = new Date();
  const dateFrom = new Date(now);
  dateFrom.setDate(now.getDate() + randomDaysOffset);

  const dateTo = new Date(dateFrom);
  dateTo.setDate(dateFrom.getDate() + getRandomInt(1, 7));

  return {
    id: idEvent(),
    basePrice: getRandomInt(BasePriceRange.MIN, BasePriceRange.MAX),
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
    destination: destinationElement.id,
    favorite: Boolean(getRandomInt(0, 1)),
    offersId,
    type,
  };
};

export { getRandomEvent, getDestination, getOffers };
