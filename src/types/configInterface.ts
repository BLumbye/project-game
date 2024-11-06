import { ConfigActivities, Event } from './types';

export interface Config {
  name: string;
  bid: {
    /** If the user submitted bid exceeds this value set it to default */
    max: number;
    /** If the user submitted is under this value set it to default */
    min: number;
    /** The default bid value used in freeplay games and the value set in synchronized mode
     * if the user submitted bid is invalid or is outside the range set by min and max.
     */
    default: number;
    /** The default duration of the bid. Only used in free play mode. */
    defaultDuration: number;
  };
  finances: {
    loanInterest: number;
    overdraftInterest: number;
    consumables: number;
    overhead: number;
    projectDelayPenalty: number;
    expressMultiplier: number;
  };
  equipment: {
    [key: string]: {
      label: string;
      cost: number;
      /** If it is possible to have this equipment type express delivred. Default is true. */
      hasExpressDelivery?: boolean;
    };
  };
  workers: {
    [key: string]: {
      label: string;
      shortLabel: string;
      plural: string;
      cost: number;
    };
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
  durationIdentifier: {
    singular: string; // e.g. "week"
    plural: string; // e.g. "weeks"
    iterative: string; // e.g. "weekly"
  };
  loansEnabled: boolean;
  displayOverhead?: boolean;
  displayConsumables?: boolean;
  displayProjectDelayPenalty?: boolean;
  activities: ConfigActivities;
  events: Record<string, Event>;
}
