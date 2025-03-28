const POINT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const DESTINATIONS = ['Vien','Moscow','Rotterdam','Kioto','Sochi','Amsterdam','Oslo','Valencia'];

const FILTERS = [
  {
    id: 'filter-everything',
    name: 'EVERYTHING',
    value: 'everything',
    status: 'checked'
  },
  {
    id: 'filter-future',
    name: 'FUTURE',
    value: 'future',
    status: ''
  },
  {
    id: 'filter-present',
    name: 'PRESENT',
    value: 'present',
    status: ''
  },
  {
    id: 'filter-past',
    name: 'PAST',
    value: 'past',
    status: ''
  }
];

const SORT_BUTTONS = [
  {
    name: 'day',
    status: 'checked'
  },
  {
    name: 'event',
    status: 'disabled'
  },
  {
    name: 'time',
    status: ''
  },
  {
    name: 'price',
    status: ''
  },
  {
    name: 'offer',
    status: 'disabled'
  }
];

const SORT_TYPES = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price',
};

const USER_ACTIONS = {
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  LOAD_EVENTS: 'LOAD_EVENTS',
  LOAD_ERROR: 'LOAD_ERROR',
  EVENTS_LOADED: 'EVENTS_LOADED',
};

export { POINT_TYPES, FILTERS, SORT_BUTTONS, SORT_TYPES, DESTINATIONS, USER_ACTIONS };
