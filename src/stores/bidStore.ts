import { defineStore } from 'pinia';
import { bidType } from '../types/types';

export const useBidStore = defineStore('bid', () => {
  // State
  const bidPrice = ref(1000000);
  const bidDuration = ref(9);
  const expectedPrice = ref(1000000);
  const expectedDuration = ref(9);

//ACTIONS

  function updateBid(bidLabel: bidType, n: number){
    switch(bidLabel){
      case 'bidPrice':
        bidPrice.value = n;
        break;
      case 'bidDuration':
        bidDuration.value = n;
      break;
      case 'expectedDuration':
        expectedDuration.value = n;
      break;
      case 'expectedPrice':
        expectedPrice.value = n;
      break;
    }
  }
  
  return { bidPrice, bidDuration,expectedDuration,expectedPrice,updateBid };
});
