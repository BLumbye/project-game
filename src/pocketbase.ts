import PocketBase, { ClientResponseError, RecordService } from 'pocketbase';

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL;

export const pocketbase = new PocketBase(pocketbaseUrl);
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
};

export const updateExistingOrCreate = async (collection: RecordService, filter: string, data: Record<string, any>) => {
  try {
    const existingRecord = await collection.getFirstListItem(filter);
    return await collection.update(existingRecord.id, data);
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      // Not found - create a new
      return await collection.create(data);
    } else if (error instanceof ClientResponseError && error.status === 400) {
      // Between the time we checked for the record and now, it was created - update instead
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
