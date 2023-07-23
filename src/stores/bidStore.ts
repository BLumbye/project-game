import { defineStore } from 'pinia';
import { bidType } from '../types/types';
import { collections, pocketbase, updateExistingOrCreate } from '~/pocketbase';
import { ClientResponseError } from 'pocketbase';

const dbUpdateCooldown = 2000;

export const useBidStore = defineStore('bid', () => {
  const gameStore = useGameStore();
  let dbUpdateTimeout: number | undefined = undefined;

  // State
  const bidPrice = ref(1000000);
  const bidDuration = ref(9);
  const expectedPrice = ref(1000000);
  const expectedDuration = ref(9);
  const accepted = ref(false);

  // Getters
  const isBidValid = computed(() => bidPrice.value !== undefined && bidPrice.value > 0
                                    && bidDuration.value !== undefined && bidDuration.value > 0
                                    && expectedPrice.value !== undefined && expectedPrice.value > 0
                                    && expectedDuration.value !== undefined && expectedDuration.value > 0);

  //ACTIONS
  function updateBid(bidLabel: bidType, n: number){
    const bidVars = {
      'bidPrice': bidPrice,
      'bidDuration': bidDuration,
      'expectedDuration': expectedDuration,
      'expectedPrice': expectedPrice
    };

    const bidVar = bidVars[bidLabel];

    if (bidVar.value === n) return;

    bidVar.value = n;

    if (gameStore.synchronized) {
      if (dbUpdateTimeout) clearTimeout(dbUpdateTimeout);
      dbUpdateTimeout = setTimeout(async () => {
        console.log('updating');
        dbUpdateTimeout = undefined;
        updateExistingOrCreate(collections.bids, `user.username="${pocketbase.authStore.model!.username}"`, {
          user: pocketbase.authStore.model!.id,
          bid_price: bidPrice.value,
          bid_duration: bidDuration.value,
          expected_duration: expectedDuration.value,
          expected_price: expectedPrice.value
        });
      }, dbUpdateCooldown);
    }
  }

  function acceptBid() {
    accepted.value = true;
  }
  
  return { bidPrice, bidDuration,expectedDuration,expectedPrice, accepted, isBidValid, updateBid, acceptBid };
});
