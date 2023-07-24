/**
 * Config
 *
 *
 * The Config file is where all relevant constant values are set.
 * This is also where activities are defined.
 */

import { Activity, Event } from './types/types';

//Prices
const loanInterest: number = 0.01;
const overdraftInterest: number = 0.1;

const consumables: number = 50000;
const overhead: number = 10000;

const projectDelayPenalty: number = 20000;

//Salary
const labourPay: number = 800;
const skilledPay: number = 1500;
const electricianPay: number = 2000;

//Payments
const startBudget: number = 0.2; //Money at start of the project
const allActivitesCompleteReward: number = 0.3;
const milestoneReward: number = 0.5; //Percentage paid on a certain activity completion

//Milestone activity
const milestoneActivity: typeof activities[number]['label'] = 'A';

//Time limit
const projectDuration: number = 13;

// Currency
const currency: string = '€';

//Events
const events : Event [] = [
  {
    week: 1,
    image: 'https://via.placeholder.com/150',
    title: 'OPPORTUNITY TO SPEED UP YOUR PROJECT',
    description: 'Your site manager reported that activity H is a resource dependant activity, and therefore, you can double the speed, by doubling the number of workers.'
    /*effects: {
      //Activity H can be completed quicker by doubling number of workers
    }*/
  },
  {
    week: 2,
    image: 'https://via.placeholder.com/150',
    title: 'CORONA VIRUS - NEW WAVE?',
    description: 'The government announced that the new wave of corona virus might affect the construction industry. The government is considering a lockdown, which might affect the supply of materials and workers.',
    // NO EFFECT!
  },
  {
    week: 3,
    image: 'https://via.placeholder.com/150',
    title: 'NOTHING TO REPORT',
    description: 'Nothing to report this week.',
    // NO EFFECT!
  },
  {
    week: 4,
    image: 'https://via.placeholder.com/150',
    title: 'NOTHING TO REPORT',
    description: 'Nothing to report this week.',
    // NO EFFECT!
  },
  {
    week: 5,
    image: 'https://via.placeholder.com/150',
    title: 'BAD WEATHER',
    description: 'The cladding stage 1 (Task J) takes one week longer than planned! The forecast shows it might continue.',
    /*effects: {
      //Activity J takes one week longer
    }*/
  },
  {
    week: 6,
    image: 'https://via.placeholder.com/150',
    title: 'NOTHING TO REPORT',
    description: 'Nothing to report this week.',
    // NO EFFECT!
  },
  {
    week: 7,
    image: 'https://via.placeholder.com/150',
    title: 'UNION REQUEST',
    description: 'Workers formed a strong union and request one more labour worker to be allocated to tasks K,G and L, if these tasks are still ongoing, e.g. task K requires 5 instead of 4 LAB. Due to exensive negotiation, you managed to agree that the request will only take effect from week 9 onwards.',
    /*effects: {
      //Activity K, g and L require one more Labourer (LAB) from week 9 onwards
    }*/
  },
  {
    week: 8,
    image: 'https://via.placeholder.com/150',
    title: 'NOTHING TO REPORT',
    description: 'Nothing to report this week.',
    // NO EFFECT!
  },
  {
    week: 9,
    image: 'https://via.placeholder.com/150',
    title: 'NOTHING TO REPORT',
    description: 'Nothing to report this week.',
    // NO EFFECT!
  },
  {
    week: 10,
    image: 'https://via.placeholder.com/150',
    title: 'NOTHING TO REPORT',
    description: 'Nothing to report this week.',
    // NO EFFECT!
  },
]

//Activities
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

export default {
  milestoneActivity,
  allActivitesCompleteReward,
  startBudget,
  milestoneReward,
  projectDelayPenalty,
  overhead,
  consumables,
  loanInterest,
  overdraftInterest,
  duration: projectDuration,
  activities,
  events,
  labourPay,
  skilledPay,
  electricianPay,
  currency,
};
