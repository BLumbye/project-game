/**
 * Types
 *
 * This is where relevant general types and interfaces are defined.
 */

import config from '~/config';
import { Config } from './configInterface';

export type EquipmentStatus = 'unordered' | 'ordered' | 'delivered';
export type DeliveryType = 'regular' | 'express';
export type bidType = 'bidPrice' | 'bidDuration' | 'expectedPrice' | 'expectedDuration';

export interface DurationParameters {
  equipment: Record<string, Equipment>;
}

export interface Activity {
  label: string;
  duration: number;
  expressDuration?: number; //Only relevant for equipment
  progress: number;
  requirements: Partial<{
    workers: Partial<Record<string, number>>;
    activities: string[];
    equipment: string[];
  }>;
  allocation: Record<string, number>;
  hidden?: boolean;
}

export type ConfigActivity = Pick<Activity, 'label' | 'duration' | 'expressDuration' | 'requirements' | 'hidden'>;
export type ConfigActivities = ConfigActivity[];

export interface Event {
  week: number;
  image: string;
  title: string;
  description: string;
  effects?: EventEffect[];
  showTitle: boolean;
  showDescription: boolean;
  choices?: {
    [key: string]: {
      label: string;
      chosenText: string;
      effects?: EventEffect[];
    };
  };
  accepted?: boolean;
}

export interface EventEffect {
  activityLabels?: string[]; // An array of activity labels to be affected
  workersModification?: Partial<Record<string, number>>; // The new number of workers needed
  durationModification?: number; // The new duration of the activity
  resourceDependant?: boolean; // Whether the activitity can be sped up by using more workers
  revealActivity?: boolean; // A previously hidden activity is revealed
  immediateReward?: number; // The immediate reward for accepting the event
  bidDurationModification?: number; // How much to modify the bid duration with (does not factor in for results calculation) -- ONLY WORKS FOR CHOICE EVENTS
}

export interface Equipment {
  status: EquipmentStatus;
  deliveryType?: DeliveryType;
}

export interface User {
  id: string;
  username: string;
}

export interface Bid {
  id: string;
  userID: string;
  price: number;
  promisedDuration: number;
  expectedCost: number;
  expectedDuration: number;
  revisedPrice: number;
}

export interface SurveyAnswer {
  id: string;
  userID: string;
  projectType: string;
  caseIndustry: string;
  location: string;
  profitConfidence: number;
  timeConfidence: number;
  topPerformerConfidence: number;
  projectAbility: string;
  projectKnowledge: string;
  superiorKnowledge: string;
}

export interface AdminGameState {
  userID: string;
  status: 'playing' | 'won' | 'lost' | 'not_started';
  week: number;
  progress: number;
  ready: boolean;
  eventChoices: Record<string, string>;
}

export interface GameSummary {
  id: string;
  userID: string;
  week: number;
  totalBalance: number;
  totalLoaned: number;
  totalRepaid: number;
  status: 'playing' | 'won' | 'lost';
}

export type GameState = 'adding_users' | 'getting_bids' | 'reviewing_bids' | 'in_progress' | 'finished';
