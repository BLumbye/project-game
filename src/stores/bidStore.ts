import { defineStore } from 'pinia';
import { bidType } from '../types/types';
import { collections, pocketbase, updateExistingOrCreate } from '~/pocketbase';
import { ClientResponseError } from 'pocketbase';

const dbUpdateCooldown = 2000;

/**
 * This store contains information about the groups bid.
 * If in free play everything is stored in memory, in synchronized mode it is stored in the database.
 * It uses the following flow to connect with database:
 * 1. When we know we are in synchronized mode, we fetch the bid from the database if it exists. If not we use the default data and create the bid in the database.
 * 2. When the bid is updated, we update the bid in the database after a cooldown.
 * 3. We subscribe to the created record to keep the bid in sync with the database.
 */

export const useBidStore = defineStore('bid', () => {
  const gameStore = useGameStore();
  let dbUpdateTimeout: NodeJS.Timeout | undefined = undefined;
  let recordID: string | undefined = undefined;

  // State
  const loading = ref(true);
  const bidPrice = ref<number>(0);
  const bidDuration = ref<number>(0);
  const expectedPrice = ref<number>(0);
  const expectedDuration = ref<number>(0);
  const ready = ref(false);

  // Getters
  const isBidValid = computed(
    () =>
      bidPrice.value !== undefined &&
      bidPrice.value > 0 &&
      bidDuration.value !== undefined &&
      bidDuration.value > 0 &&
      expectedPrice.value !== undefined &&
      expectedPrice.value > 0 &&
      expectedDuration.value !== undefined &&
      expectedDuration.value > 0,
  );

  //ACTIONS
  function updateBid(bidLabel: bidType, n: number) {
    const bidVars = {
      bidPrice: bidPrice,
      bidDuration: bidDuration,
      expectedDuration: expectedDuration,
      expectedPrice: expectedPrice,
    };

    const bidVar = bidVars[bidLabel];

    if (bidVar.value === n) return;

    bidVar.value = n;

    // Update database after cooldown
    if (gameStore.synchronized) {
      if (dbUpdateTimeout) clearTimeout(dbUpdateTimeout);
      dbUpdateTimeout = setTimeout(updateDatabase, dbUpdateCooldown);
    }
  }

  function updateDatabase() {
    dbUpdateTimeout = undefined;
    collections.bids.update(recordID!, {
      user: pocketbase.authStore.model!.id,
      bid_price: bidPrice.value,
      bid_duration: bidDuration.value,
      expected_duration: expectedDuration.value,
      expected_price: expectedPrice.value,
      ready: ready.value,
    });
  }

  /**
   * Assumes we are in synchronized mode.
   */
  function toggleReady() {
    ready.value = !ready.value;
    if (dbUpdateTimeout) clearTimeout(dbUpdateTimeout);
    updateDatabase();
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
      recordID = record.id;
      bidPrice.value = record.bid_price;
      bidDuration.value = record.bid_duration;
      expectedDuration.value = record.expected_duration;
      expectedPrice.value = record.expected_price;
    } catch (error) {
      throw error;
    }

    // Subscribe to bid record
    collections.bids.subscribe(recordID, (data) => {
      bidPrice.value = data.record['bid_price'];
      bidDuration.value = data.record['bid_duration'];
      expectedDuration.value = data.record['expected_duration'];
      expectedPrice.value = data.record['expected_price'];
    });

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
    bidPrice,
    bidDuration,
    expectedDuration,
    expectedPrice,
    ready,
    isBidValid,
    updateBid,
    toggleReady,
    connectWithDatabase,
  };
});
