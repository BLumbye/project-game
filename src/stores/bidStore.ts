import { defineStore } from 'pinia';
import { bidType } from '../types/types';
import { collections, pocketbase, updateExistingOrCreate } from '~/pocketbase';
import { ClientResponseError } from 'pocketbase';
import config from '~/config';

export const useBidStore = defineStore('bid', () => {
  const gameStore = useGameStore();

  // State
  const loading = ref(true);
  const price = ref<number>(0);
  const promisedDuration = ref<number>(0);

  // Getters

  // Actions
  async function createBid(data: any) {
    price.value = data.price > config.maxBid || data.price < config.minBid ? config.defaultBid : data.price;
    promisedDuration.value = data.promised_duration;

    const record = await collections.bids.create({
      ...data,
      user: pocketbase.authStore.model!.id,
      game_id: gameStore.gameID,
      revised_price: price.value,
    });

    // Subscribe to bid record
    collections.bids.subscribe(record.id, (data) => {
      price.value = data.record['revised_price'];
      promisedDuration.value = data.record['promised_duration'];
    });
  }

  // Logic
  async function connectWithDatabase() {
    if (!gameStore.synchronized || !pocketbase.authStore.isValid || pocketbase.authStore.model!.admin) {
      loading.value = false;
      return;
    }

    // Get existing bid from database or create new one
    try {
      const record = await collections.bids.getFirstListItem(`user.username="${pocketbase.authStore.model!.username}"`);
      price.value = record.revised_price;
      promisedDuration.value = record.promised_duration;

      // Subscribe to bid record
      collections.bids.subscribe(record.id, (data) => {
        price.value = data.record['revised_price'];
        promisedDuration.value = data.record['promised_duration'];
      });
    } catch (error) {
      if (!(error instanceof ClientResponseError) || error.status !== 404) {
        throw error;
      }
    }

    loading.value = false;
  }

  if (gameStore.settingsLoaded) {
    connectWithDatabase();
  } else {
    const synchronizedWatcher = watch(
      () => gameStore.settingsLoaded,
      () => {
        if (gameStore.settingsLoaded) synchronizedWatcher();
        connectWithDatabase();
      },
    );
  }

  return {
    loading,
    price,
    promisedDuration,
    connectWithDatabase,
    createBid,
  };
});
