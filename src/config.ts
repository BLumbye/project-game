/**
 * Config
 *
 *
 * The Config file is where all relevant constant values are set.
 * This is also where activities are defined.
 */

import { ConfigActivities, Event } from './types/types';
import { addWorkers } from './utils/configUtils';

//Prices
const loanInterest: number = 0.01;
const overdraftInterest: number = 0.1;

const consumables: number = 100;
const overhead: number = 0;

const projectDelayPenalty: number = 20000;

const equipmentPrices: number[] = [3000, 1000, 130000]; //last not used in light version

//Salary
const labourPay: number = 30; //student
const skilledPay: number = 200; //technician
const electricianPay: number = 2000; //NOT USED IN LIGHT VERSION

//Payments
const startBudget: number = 1.; //Money at start of the project
const allActivitesCompleteReward: number = 0.0;
const milestoneReward: number = 0.; //Percentage paid on a certain activity completion

//Milestone activity
const milestoneActivity: (typeof activities)[number]['label'] = 'A'; //NO MILESTONE

//Time limit
const projectDuration: number = 8;

// Currency
const currency: string = '€';

//Activities
const activities: ConfigActivities = [
  {
    label: 'A',
    duration: 1,
    requirements: { workers: { skilled: 4 } },
  },
  {
    label: 'B',
    duration: 1,
    requirements: { workers: { labour: 1 }, activities: ['A'] },
  },
  {
    label: 'C',
    duration: 1,
    requirements: {
      workers: { labour: 2 },
      activities: ['A'],
    },
  },
  {
    label: 'D',
    duration: 1,
    requirements: { workers: { skilled: 3 }, activities: ['B', 'C'], equipment: ['steelwork'] },
  },
  {
    label: 'E',
    duration: 1,
    requirements: {
      workers: {
        labour: 2,
      },
      activities: ['D'],
      equipment: ['interior'],
    },
  },
];

//Events
const events: Event[] = [
  {
    week: 1,
    image: '/images/Week1.jpg',
    title: 'OPPORTUNITY',
    description:
      "You receive a call from the company delivering the fridges. It is possible to bring them in in one day for an extra 300€. Choose 'Express Delivery' in the Fridges drop-down box (equipment section) to take advantage of this opportunity. Note: The activity cannot take less than 1 day.",
    //NO EFFECT! But reminds of express delivery
    showTitle: true,
    showDescription: true,
  },
  {
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
  {
    week: 3,
    image: '/images/rumour.jpg',
    title: 'STUDENT PARTY',
    description: 'During lunch, you overhear a few students planning to go partying tonight...',
    //NO EFFECT
    showTitle: true,
    showDescription: true,
  },
  {
    week: 4,
    image: '/images/hungover.jpg',
    title: 'HANGOVERS',
    description:
      'All of the students are very hungover and are planning on keeping the party going all through the week. Every student volunteer activity will need an extra student volunteer as they are not working at their full potential.',
    effects: [...addWorkers(['B', 'C', 'E'], ['labour'], 1, activities)],
    showTitle: true,
    showDescription: true,
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
  equipmentPrices,
};
