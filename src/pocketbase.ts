import PocketBase from 'pocketbase';

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL;

export const pocketbase = new PocketBase(pocketbaseUrl);
