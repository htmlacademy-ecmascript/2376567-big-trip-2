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

export { POINT_TYPES, filters };
