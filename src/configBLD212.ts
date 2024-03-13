/**
 * Config for spring course (Project: BLD212)
 *
 *
 * The Config file is where all relevant constant values are set.
 * This is also where activities are defined.
 */

import { Config } from './types/configInterface';
import { addWorkers } from './utils/configUtils';

const baseConfig: Omit<Config, 'events'> = {
  bid: {
    max: 80000000, //Original 1200000
    min: 65000000, //Original 800000
    default: 70000000, //Original 850000
  },
  finances: {
    loanInterest: 0.01,
    overdraftInterest: 0.1,
    consumables: 400000 * 4, //Original 50000
    overhead: 75000 * 4, //Original 10000
    projectDelayPenalty: 150000 * 4, //Original 20000
    expressMultiplier: 1.1,
  },
  equipment: {
    concrete: {
      label: 'Concrete Elements (Task A)',
      cost: 3000000, //Original 38000
    },
    interior: {
      label: 'Interior (Task B)',
      cost: 12000000, //Original 28000
    },
    lab: {
      label: 'Lab Equipment (Task C)',
      cost: 16000000, //Original 130000
    },
  },
  workers: {
    labour: {
      label: 'labour',
      shortLabel: 'LAB',
      plural: 'labourers',
      cost: 42000, //Original 800
    },
    skilled: {
      label: 'skilled',
      shortLabel: 'SKI',
      plural: 'skilled workers',
      cost: 70000, //Original 1500
    },
    electrician: {
      label: 'electrician',
      shortLabel: 'ELE',
      plural: 'electricians',
      cost: 84000, //Original 2000
    },
  },
  payments: {
    startBudget: 0.3,
    milestoneReward: 0.5,
    allActivitiesCompleteReward: 0.2,
    milestoneActivity: 'H',
  },
  projectDuration: 12,
  currency: {
    region: 'da-DK',
    currency: 'DKK',
  },
  durationIdentifier: {
    singular: 'month',
    plural: 'months',
    iterative: 'monthly',
  },
  loansEnabled: false,
  activities: [
    {
      label: 'A',
      duration: 2,
      expressDuration: 1,
      requirements: {
        equipment: ['concrete'],
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
        equipment: ['lab'],
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
          labour: 6 * 2,
        },
        activities: ['D'],
      },
    },
    {
      label: 'F',
      duration: 1,
      requirements: {
        workers: {
          labour: 4 * 2,
        },
        activities: ['D'],
      },
    },
    {
      label: 'G',
      duration: 3,
      requirements: {
        workers: {
          labour: 4 * 2,
        },
        activities: ['E'],
      },
    },
    {
      label: 'H',
      duration: 2,
      requirements: {
        workers: {
          labour: 2 * 2,
          skilled: 4 * 2,
        },
        activities: ['A', 'F'],
      },
    },
    {
      label: 'I',
      duration: 1,
      requirements: {
        workers: {
          labour: 1 * 2,
          skilled: 6 * 2,
        },
        activities: ['B', 'H'],
      },
    },
    {
      label: 'J',
      duration: 1,
      requirements: {
        workers: {
          labour: 4 * 2,
          skilled: 3 * 2,
        },
        activities: ['H'],
      },
    },
    {
      label: 'K',
      duration: 2,
      requirements: {
        workers: {
          labour: 4 * 2,
          skilled: 2 * 2,
          electrician: 8 * 2,
        },
        activities: ['C', 'I'],
      },
    },
    {
      label: 'L',
      duration: 1,
      requirements: {
        workers: {
          labour: 2 * 2,
          skilled: 2 * 2,
        },
        activities: ['C', 'K'],
      },
    },
    {
      label: 'M',
      duration: 1,
      requirements: {
        workers: {
          labour: 3 * 2,
        },
        activities: ['G', 'L'],
      },
      hidden: true,
    },
  ],
};

const events: Config['events'] = {
  opportunity: {
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
  headhunting: {
    week: 2,
    image: '/images/HEADHUNTING.jpg',
    title: 'HEADHUNTING',
    description:
      'ONE OF YOUR COMPETITORS HEADHUNTED A KEY MEMBER OF YOUR TEAM! One of the key members of your team (chosen randomly) will move to another team. Upside: You have been good at networking and spotted a bright talent in another company to substitute your teammate!',
    //No in-game effect
    showTitle: true,
    showDescription: true,
  },
  corona: {
    week: 3,
    image: '/images/Week3.png',
    title: 'NEW CORONA WAVE?',
    description:
      'A new strain of COVID has been discovered. How contagious it is, is as of yet unknown. The government is considering a lockdown.',
    // NO EFFECT!
    showTitle: false,
    showDescription: false,
  },
  delayedDeliveries: {
    week: 4,
    image: '/images/Week4.jpg',
    title: 'DELAYED DELIVERIES',
    description: `Supply chains have been disrupted and Lab Equipment (Task C) is delayed by one ${baseConfig.durationIdentifier.singular}`,
    effects: [
      {
        activityLabels: ['C'],
        durationModification: 1,
      },
    ],
    showTitle: true,
    showDescription: true,
  },
  badWeather: {
    week: 5,
    image: '/images/Week5.jpg',
    title: 'BAD WEATHER',
    description: `The cladding stage 1 (Task J) takes one ${baseConfig.durationIdentifier.singular} longer than planned! The forecast shows it might continue.`,
    effects: [
      {
        activityLabels: ['J'],
        durationModification: 1,
      },
    ],
    showTitle: true,
    showDescription: true,
  },
  terraceExtension: {
    week: 6,
    image: '/images/ExtraActivity.jpg',
    title: 'OPPORTUNITY FROM PROJECT OWNER',
    description: `Your project owner has an offer for you. You have been given an optional task to build a terrace extension (Task M).
      It requires six labourers. You can deny the request, but you will be paid an extra 3.000.000,00 ${baseConfig.currency.currency} if you manage it.
      \n Do you accept?`,
    effects: [
      {
        activityLabels: ['M'],
        revealActivity: true, // Reveal activity M
        immediateReward: 3000000, // Reward for accepting -> baseConfig.finances.consumables + baseConfig.finances.overhead + baseConfig.workers.labour.cost * 6 + 1000000
      },
    ],
    showTitle: true,
    showDescription: true,
    choice: true,
  },
  rumours: {
    week: 6,
    image: '/images/Week6.jpg',
    title: 'RUMOURS',
    description:
      'There are some rumours around that the labour workers are dissatisfied. They claim there are too much work and not enough people.',
    // NO EFFECT!
    showTitle: true,
    showDescription: true,
  },
  unionRequest: {
    week: 7,
    image: '/images/Week7.jpg',
    title: 'UNION REQUEST',
    description:
      'Workers have been in talk with their union and request one more labour worker to be allocated to tasks K, G and L, if these tasks are still ongoing, e.g. task K requires 9 instead of 8 LAB. Due to exensive negotiation, you managed to agree that the request will only take effect from month 9 onwards.',
    showTitle: true,
    showDescription: true,
  },
  unionRequest2: {
    week: 9,
    image: '/images/Week9.jpg',
    title: 'UNION REQUEST',
    description: "The agreement with the workers' union has now been formed and is in effect.",
    effects: [...addWorkers(['K', 'G', 'L'], ['labour'], 1)],
    showTitle: true,
    showDescription: true,
  },
};

export default {
  ...baseConfig,
  events,
} satisfies Config;
