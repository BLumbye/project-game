import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBidStore = defineStore('bid', () => {
  // State
  const price = ref(1000000);
  const duration = ref(9);

  return { price, duration };
});
