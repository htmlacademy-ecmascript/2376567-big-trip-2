const POINT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const filters = [
  {
    id: 'filter-everything',
    name: 'EVERYTHING',
    value: 'everything'
  },
  {
    id: 'filter-future',
    name: 'FUTURE',
    value: 'future'
  },
  {
    id: 'filter-present',
    name: 'PRESENT',
    value: 'present'
  },
  {
    id: 'filter-past',
    name: 'PAST',
    value: 'past'
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
