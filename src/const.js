const POINT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const filters = [
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

const sortButtons = [
  {
    name: 'day',
    status: 'checked'
  },
  {
    name: 'event',
    status: ''
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
    status: ''
  }
];

export { POINT_TYPES, filters, sortButtons };
