import { defineStore } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { pocketbase } from '../pocketbase';

export const useGameStore = defineStore('game', () => {
  //Uses setup store
  // State
  const week = ref(0);
  /**
   * Whether a not the server is running in synchronized mode.
   * Synchronized mode means that the player can only progress to the next week when allowed by the admins.
   */
  const { state: synchronized, isReady: synchronizedReady } = useAsyncState<boolean>(pocketbase.collection('settings').getList(1, 1).then(result => result.items[0].synchronized), true);

  // Getters
  const decisionForm = computed(() => week.value + 1);
  

  // Actions

  /**
   * Progresses the week when the player is done with the decision form
   */
  function nextWeek() {
    week.value++;
  }

  return { week, decisionForm, nextWeek, synchronized, synchronizedReady };
});
