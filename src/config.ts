/**
 * Config
 *
 *
 * The Config file is where all relevant constant values are set.
 * This is also where activities are defined.
 */

import { Config } from './types/configInterface';
import { addWorkers } from './utils/configUtils';

export default {
  bid: {
    max: 9000000, //Original 1200000
    min: 6000000, //Original 800000
    default: 6500000, //Original 850000
  },
  finances: {
    loanInterest: 0.01,
    overdraftInterest: 0.1,
    consumables: 400000, //Original 50000
    overhead: 75000, //Original 10000
    projectDelayPenalty: 150000, //Original 20000
    equipmentCost: [300000, 210000, 975000], //Original [38000, 28000, 130000]
    expressMultiplier: 1.1,
    labourPay: 6000, //Original 800
    skilledPay: 11000, //Original 1500
    electricianPay: 15000, //Original 2000
  },
  payments: {
    startBudget: 0.2,
    allActivitiesCompleteReward: 0.3,
    milestoneReward: 0.5,
    milestoneActivity: 'H',
  },
  projectDuration: 12,
  currency: {
    region: 'da-DK',
    currency: 'DKK',
  },
  loansEnabled: false,
  activities: [
    {
      label: 'A',
      duration: 2,
      expressDuration: 1,
      requirements: {
        equipment: ['steelwork'],
      },
    },
    {
      label: 'B',
      duration: 3,
      expressDuration: 2,
      requirements: {
        equipment: ['interior'],
      },
    },
    {
      label: 'C',
      duration: 5,
      expressDuration: 4,
      requirements: {
        equipment: ['tbs'],
      },
    },
    {
      label: 'D',
      duration: 1,
      requirements: {},
    },
    {
      label: 'E',
      duration: 3,
      requirements: {
        workers: {
          labour: 6,
        },
        activities: ['D'],
      },
    },
    {
      label: 'F',
      duration: 1,
      requirements: {
        workers: {
          labour: 4,
        },
        activities: ['D'],
      },
    },
    {
      label: 'G',
      duration: 3,
      requirements: {
        workers: {
          labour: 4,
        },
        activities: ['E'],
      },
    },
    {
      label: 'H',
      duration: 2,
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
      duration: 1,
      requirements: {
        workers: {
          labour: 1,
          skilled: 6,
        },
        activities: ['B', 'H'],
      },
    },
    {
      label: 'J',
      duration: 1,
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
      duration: 2,
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
      duration: 1,
      requirements: {
        workers: {
          labour: 2,
          skilled: 2,
        },
        activities: ['C', 'K'],
      },
    },
  ],
  events: [
    {
      week: 1,
      image: '/images/Week1.jpg',
      title: 'OPPORTUNITY',
      description:
        'Your site manager reported that activity H is a resource dependant activity, and therefore, you can double the speed, by doubling the number of workers.',
      effects: [
        {
          activityLabels: ['H'],
          resourceDependant: true,
        },
      ],
      showTitle: true,
      showDescription: true,
    },
    {
      week: 3,
      image: '/images/Week3.png',
      title: 'NEW CORONA WAVE?',
      description:
        'The government announced that the new wave of corona virus might affect the construction industry. The government is considering a lockdown, which might affect the supply of materials and workers.',
      // NO EFFECT!
      showTitle: false,
      showDescription: false,
    },
    {
      week: 4,
      image: '/images/Week4.jpg',
      title: 'DELAYED DELIVERIES',
      description: 'OH NO...! \n ALL the procurement that has not yet been delivered have been delayed by 1 week!',
      effects: [
        {
          activityLabels: ['A'],
          durationModification: 1,
        },
        {
          activityLabels: ['B'],
          durationModification: 1,
        },
        {
          activityLabels: ['C'],
          durationModification: 1,
        },
      ],
      showTitle: true,
      showDescription: true,
    },
    {
      week: 5,
      image: '/images/Week5.jpg',
      title: 'BAD WEATHER',
      description:
        'The cladding stage 1 (Task J) takes one week longer than planned! The forecast shows it might continue.',
      effects: [
        {
          activityLabels: ['J'],
          durationModification: 1,
        },
      ],
      showTitle: true,
      showDescription: true,
    },
    {
      week: 6,
      image: '/images/Week6.jpg',
      title: 'RUMOURS',
      description:
        'RUMOURS… \n There are some rumours around that the labour workers are dissatisfied. They claim there are too much work and not enough people.',
      // NO EFFECT!
      showTitle: true,
      showDescription: true,
    },
    {
      week: 7,
      image: '/images/Week7.jpg',
      title: 'UNION REQUEST',
      description:
        'Workers formed a strong union and request one more labour worker to be allocated to tasks K, G and L, if these tasks are still ongoing, e.g. task K requires 5 instead of 4 LAB. Due to exensive negotiation, you managed to agree that the request will only take effect from week 9 onwards.',
      showTitle: true,
      showDescription: true,
    },
    {
      week: 9,
      image: '/images/Week9.jpg',
      title: 'UNION REQUEST',
      description: 'The union has now been formed and is in effect.',
      effects: [...addWorkers(['K', 'G', 'L'], ['labour'], 1)],
      showTitle: true,
      showDescription: true,
    },
  ],
} satisfies Config;
