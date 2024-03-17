import PocketBase, { ClientResponseError, RecordService } from 'pocketbase';

export interface User {
  id: string;
  username: string;
  email: string;
  admin: boolean;
  game_id: number;
}

export interface ActivityCompletion {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  week: number;
  activity: string;
}

export interface Allocation {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  week: number;
  activity: string;
  worker_type: string;
  value: number;
}

export interface Bid {
  id: string;
  /// References the user id
  user: string;
  price: number;
  promised_duration: number;
  expected_cost: number;
  expected_duration: number;
  game_id: number;
  revised_price: number;
}

export interface Equipment {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  week: number;
  equipment_type: string;
  status: string;
  delivery_type: string;
}

export interface Finance {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  week: number;
  timeline: string;
  value: number;
}

export interface GameSummary {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  week: number;
  total_balance: number;
  total_loaned: number;
  total_repaid: number;
  status: 'playing' | 'won' | 'lost';
}

export interface Progress {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  week: number;
  activity: string;
  progress: number;
}

export interface Ready {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  week: number;
  ready: boolean;
}

export interface Settings {
  id: string;
  synchronized: boolean;
  current_week: number;
  game_id: number;
  game_state: 'adding_users' | 'getting_bids' | 'reviewing_bids' | 'in_progress' | 'finished';
}

export interface SurveyAnswer {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  project_type: string;
  case_industry: string;
  location: string;
  profit_confidence: number;
  time_confidence: number;
  top_performer_confidence: number;
  project_ability: string;
  project_knowledge: string;
  superior_knowledge: string;
}

export interface TotalProgress {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  week: number;
  progress: number;
}

export interface Workers {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  week: number;
  worker_type: string;
  change: number;
}

export interface EventChoice {
  id: string;
  /// References the user id
  user: string;
  game_id: number;
  week: number;
  event: string;
  choice: string;
}

interface TypedPocketBase extends PocketBase {
  collection(idOrName: string): RecordService;
  collection(idOrName: 'users'): RecordService<User>;
  collection(idOrName: 'activity_completion'): RecordService<ActivityCompletion>;
  collection(idOrName: 'allocation'): RecordService<Allocation>;
  collection(idOrName: 'bids'): RecordService<Bid>;
  collection(idOrName: 'equipment'): RecordService<Equipment>;
  collection(idOrName: 'finance'): RecordService<Finance>;
  collection(idOrName: 'game_summary'): RecordService<GameSummary>;
  collection(idOrName: 'progress'): RecordService<Progress>;
  collection(idOrName: 'ready'): RecordService<Ready>;
  collection(idOrName: 'settings'): RecordService<Settings>;
  collection(idOrName: 'survey_answers'): RecordService<SurveyAnswer>;
  collection(idOrName: 'total_progress'): RecordService<TotalProgress>;
  collection(idOrName: 'workers'): RecordService<Workers>;
  collection(idOrName: 'event_choices'): RecordService<EventChoice>;
}

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL;

export const pocketbase = new PocketBase(pocketbaseUrl) as TypedPocketBase;
pocketbase.autoCancellation(false);

export const collections = {
  users: pocketbase.collection('users'),
  settings: pocketbase.collection('settings'),
  bids: pocketbase.collection('bids'),
  workers: pocketbase.collection('workers'),
  equipment: pocketbase.collection('equipment'),
  finance: pocketbase.collection('finance'),
  allocation: pocketbase.collection('allocation'),
  progress: pocketbase.collection('progress'),
  ready: pocketbase.collection('ready'),
  activityCompletion: pocketbase.collection('activity_completion'),
  surveyAnswers: pocketbase.collection('survey_answers'),
  totalProgress: pocketbase.collection('total_progress'),
  gameSummary: pocketbase.collection('game_summary'),
  eventChoices: pocketbase.collection('event_choices'),
};

export const updateExistingOrCreate = async (collection: RecordService, filter: string, data: Record<string, any>) => {
  try {
    return await collection.create(data);
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 400) {
      // We couldn't create because of a unique constraint - update the existing
      const existingRecord = await collection.getFirstListItem(filter);
      return await collection.update(existingRecord.id, data);
    } else {
      throw error;
    }
  }
};

export const deleteExisting = async (collection: RecordService, filter: string) => {
  try {
    const existingRecord = await collection.getFirstListItem(filter);
    return await collection.delete(existingRecord.id);
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      return;
    } else {
      throw error;
    }
  }
};

export const isAdmin = () => pocketbase.authStore.model?.admin;
