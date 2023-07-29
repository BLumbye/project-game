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

const consumables: number = 50000;
const overhead: number = 10000;

const projectDelayPenalty: number = 20000;

//Salary
const labourPay: number = 100; //student
const skilledPay: number = 200; //technician
const electricianPay: number = 2000; //NOT USED IN LIGHT VERSION

//Payments
const startBudget: number = 0.2; //Money at start of the project
const allActivitesCompleteReward: number = 0.3;
const milestoneReward: number = 0.; //Percentage paid on a certain activity completion

//Milestone activity
const milestoneActivity: (typeof activities)[number]['label'] = 'A'; //NO MILESTONE

//Time limit
const projectDuration: number = 13;

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
TODO: 'Add images';

const events: Event[] = [
  {
    week: 1,
    image: '/images/Week1.jpg',
    title: 'OPPORTUNITY',
    description:
      "You receive a call from the company delivering the fridges. It is possible to bring them in in one day for an extra 500€. Enter '2' in the Fridge box (equipment section) for taking advantage of this opportunity. Note: The activity cannot take less than 1 day.",
    //NO EFFECT! But reminds of express delivery
    showTitle: true,
    showDescription: true,
  },
  {
    week: 2,
    image: '/images/Week3.png',
    title: 'POSSIBLE DELAY',
    description:
      "The delivery company notified you that one of the fridges got damaged during the transport. They will send a new one at no extra cost, but it will take one day longer. You just need to place the order (input '1' in the order equipment box to the right) Note: if you already received the fridges, this will not apply.",
    //TODO: IMPLEMENT EFFECT
    showTitle: true,
    showDescription: true,
  },
  {
    week: 3,
    image: '/images/Week5.jpg',
    title: 'STUDEN PARTY',
    description: 'During lunch, you overhear a few students planning to go partying tonight...',
    //NO EFFECT
    showTitle: true,
    showDescription: true,
  },
  {
    week: 4,
    image: '/images/Week6.jpg',
    title: 'HANGOVERS',
    description:
      'Some of the student volunteers that went partying last night are too hungover to work today. Note: 2 of the students hired for today are unavailable, but you still need to pay them.',
    //TODO: "Implement effect",
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
};
