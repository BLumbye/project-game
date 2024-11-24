/**
 * Config (light version)
 *
 *
 * The Config file is where all relevant constant values are set.
 * This is also where activities are defined.
 */

import { Config } from './types/configInterface';
import { addWorkers } from './utils/configUtils';

const baseConfig: Omit<Config, 'events'> = {
  name: 'Light',
  bid: {
    max: 9000,
    min: 5000,
    default: 7000,
    defaultDuration: 8,
  },
  finances: {
    loanInterest: 0.01,
    overdraftInterest: 0.1,
    consumables: 100,
    overhead: 0,
    projectDelayPenalty: 0,
    expressMultiplier: 1.1,
  },
  equipment: {
    fridges: {
      label: 'Fridges (Task D)',
      cost: 3000,
    },
    drinks: {
      label: 'Drinks (Task E)',
      cost: 1000,
      hasExpressDelivery: false,
    },
  },
  workers: {
    student: {
      label: 'student',
      shortLabel: 'STU',
      plural: 'students',
      cost: 30,
    },
    technician: {
      label: 'technician',
      shortLabel: 'TEC',
      plural: 'technicians',
      cost: 200,
    },
  },
  payments: {
    startBudget: 1,
    allActivitiesCompleteReward: 0,
    milestoneReward: 0,
    milestoneActivity: 'A',
  },
  projectDuration: 8,
  currency: {
    region: 'en-UK',
    currency: 'EUR',
  },
  durationIdentifier: {
    singular: 'day',
    plural: 'days',
    iterative: 'daily',
  },
  loansEnabled: false,
  displayOverhead: false,
  displayProjectDelayPenalty: false,
  activities: [
    {
      label: 'A',
      duration: 1,
      requirements: { workers: { technician: 4 } },
    },
    {
      label: 'B',
      duration: 1,
      requirements: { workers: { student: 1 }, activities: ['A'] },
    },
    {
      label: 'C',
      duration: 1,
      requirements: {
        workers: { student: 2 },
        activities: ['A'],
      },
    },
    {
      label: 'D',
      duration: 1,
      requirements: { workers: { technician: 3 }, activities: ['B', 'C'], equipment: ['fridges'] },
    },
    {
      label: 'E',
      duration: 1,
      requirements: {
        workers: {
          student: 2,
        },
        activities: ['D'],
        equipment: ['drinks'],
      },
    },
  ],
};

const events: Config['events'] = {
  opportunity: {
    week: 1,
    image: '/images/Week1.jpg',
    title: 'OPPORTUNITY',
    description:
      "You receive a call from the company delivering the fridges. It is possible to bring them in in one day for an extra 300€. Choose 'Express Delivery' in the Fridges drop-down box (equipment section) to take advantage of this opportunity. Note: The activity cannot take less than 1 day.",
    //NO EFFECT! But reminds of express delivery
    showTitle: true,
    showDescription: true,
  },
  slowInstallation: {
    week: 2,
    image: '/images/install.jpg',
    title: 'SLOW INSTALLATION',
    description:
      "The delivery company notified you that the fridges are of a new model and you should expect them to take longer to install. Note: Activity 'D' now takes 2 days instead of 1.",
    effects: [
      {
        activityLabels: ['D'],
        durationModification: 1,
      },
    ],
    showTitle: true,
    showDescription: true,
  },
  studentParty: {
    week: 3,
    image: '/images/rumour.jpg',
    title: 'STUDENT PARTY',
    description: 'During lunch, you overhear a few students planning to go partying tonight...',
    //NO EFFECT
    showTitle: true,
    showDescription: true,
  },
  hangovers: {
    week: 4,
    image: '/images/hungover.jpg',
    title: 'HANGOVERS',
    description:
      'All of the students are very hungover and are planning on keeping the party going all through the week. Every student volunteer activity will need an extra student volunteer as they are not working at their full potential.',
    effects: [...addWorkers(['B', 'C', 'E'], ['student'], 1)],
    showTitle: true,
    showDescription: true,
  },
};

export default {
  ...baseConfig,
  events,
} satisfies Config;
