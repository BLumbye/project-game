import { defineStore } from 'pinia';
import { Bid, collections, pocketbase } from '~/pocketbase';
import { ClientResponseError } from 'pocketbase';

export const useBidStore = defineStore('bid', () => {
  const gameStore = useGameStore();

  // State
  const loading = ref(true);
  const price = ref<number>(gameStore.config.bid.default);
  const promisedDuration = ref<number>(gameStore.config.bid.defaultDuration);
  const revised = ref(false);

  // Getters
  const durationWithModifications = computed(
    () =>
      promisedDuration.value +
      useEventStore().activeEventEffects.reduce((acc, effect) => acc + (effect.bidDurationModification || 0), 0),
  );

  // Actions
  async function createBid(data: Omit<Bid, 'user' | 'game_id' | 'revised_price' | 'id'>) {
    price.value =
      data.price > gameStore.config.bid.max || data.price < gameStore.config.bid.min
        ? gameStore.config.bid.default
        : data.price;
    promisedDuration.value = data.promised_duration;
    revised.value = price.value !== data.price;

    const record = await collections.bids.create({
      ...data,
      user: pocketbase.authStore.model!.id,
      game_id: gameStore.game!.game_id,
      revised_price: price.value,
    });

    // Subscribe to bid record
    collections.bids.subscribe(record.id, (data) => {
      price.value = data.record['revised_price'];
      promisedDuration.value = data.record['promised_duration'];
      revised.value = price.value !== data.record['price'];
    });
  }

  // Logic
  async function connectWithDatabase() {
    if (!gameStore.synchronized || !pocketbase.authStore.isValid || pocketbase.authStore.model!.admin) {
      loading.value = false;
      return;
    }

    // Get existing bid
    try {
      const record = await collections.bids.getFirstListItem(`user.username="${pocketbase.authStore.model!.username}"`);
      price.value = record.revised_price;
      promisedDuration.value = record.promised_duration;
      revised.value = price.value !== record.price;

      // Subscribe to bid record
      collections.bids.subscribe(record.id, (data) => {
        price.value = data.record['revised_price'];
        promisedDuration.value = data.record['promised_duration'];
        revised.value = price.value !== data.record['price'];
      });
    } catch (error) {
      if (!(error instanceof ClientResponseError) || error.status !== 404) {
        throw error;
      }
    }

    loading.value = false;
  }

  if (gameStore.loaded) {
    connectWithDatabase();
  } else {
    const synchronizedWatcher = watch(
      () => gameStore.loaded,
      () => {
        if (gameStore.loaded) {
          synchronizedWatcher();
          connectWithDatabase();
        }
      },
    );
  }

  return {
    loading,
    price,
    promisedDuration: durationWithModifications,
    revised,
    connectWithDatabase,
    createBid,
  };
});
