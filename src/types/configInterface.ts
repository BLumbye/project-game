import { ConfigActivities, Event } from './types';

export interface Config {
  bid: {
    /** If the user submitted bid exceeds this value set it to default */
    max: number;
    /** If the user submitted is under this value set it to default */
    min: number;
    /** The default bid value used in freeplay games and the value set in synchronized mode
     * if the user submitted bid is invalid or is outside the range set by min and max.
     */
    default: number;
  };
  finances: {
    loanInterest: number;
    overdraftInterest: number;
    consumables: number;
    overhead: number;
    projectDelayPenalty: number;
    equipmentCost: number[];
    expressMultiplier: number;
    labourPay: number;
    skilledPay: number;
    electricianPay: number;
  };
  payments: {
    startBudget: number;
    allActivitiesCompleteReward: number;
    milestoneReward: number;
    milestoneActivity: ConfigActivities[number]['label'];
  };
  projectDuration: number;
  currency: {
    region: string;
    currency: string;
  };
  activities: ConfigActivities;
  events: Event[];
}
