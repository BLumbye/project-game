import { Activity } from './types/types';

const duration = 13;
const activities: Pick<Activity, 'label' | 'duration' | 'requirements'>[] = [
  {
    label: 'A',
    duration: ({ equipment }) => (equipment.steelwork.deliveryType === 'express' ? 1 : 2),
    requirements: {
      equipment: ['steelwork'],
    },
  },
  {
    label: 'B',
    duration: ({ equipment }) => (equipment.interior.deliveryType === 'express' ? 2 : 3),
    requirements: {
      equipment: ['interior'],
    },
  },
  {
    label: 'C',
    duration: ({ equipment }) => (equipment.tbs.deliveryType === 'express' ? 4 : 5),
    requirements: {
      equipment: ['tbs'],
    },
  },
  {
    label: 'D',
    duration: () => 1,
    requirements: {},
  },
  {
    label: 'E',
    duration: () => 3,
    requirements: {
      workers: {
        labour: 6,
      },
      activities: ['D'],
    },
  },
  {
    label: 'F',
    duration: () => 1,
    requirements: {
      workers: {
        labour: 4,
      },
      activities: ['D'],
    },
  },
  {
    label: 'G',
    duration: () => 3,
    requirements: {
      workers: {
        labour: 4,
      },
      activities: ['E'],
    },
  },
  {
    label: 'H',
    duration: () => 2,
    requirements: {
      workers: {
        labour: 2,
        skilled: 4,
      },
      activities: ['A', 'F'],
    },
  },
  {
    label: 'I',
    duration: () => 1,
    requirements: {
      workers: {
        labour: 1,
        skilled: 4,
      },
      activities: ['B', 'H'],
    },
  },
  {
    label: 'J',
    duration: () => 1,
    requirements: {
      workers: {
        labour: 4,
        skilled: 3,
      },
      activities: ['H'],
    },
  },
  {
    label: 'K',
    duration: () => 2,
    requirements: {
      workers: {
        labour: 4,
        skilled: 2,
        electrician: 8,
      },
      activities: ['C', 'I'],
    },
  },
  {
    label: 'L',
    duration: () => 1,
    requirements: {
      workers: {
        labour: 2,
        skilled: 2,
      },
      activities: ['C', 'K'],
    },
  },
];

export default { duration, activities };
