import { defineStore } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { collections, pocketbase } from '../pocketbase';

/**
 * This store contains overall information about the game, and also controls the flow
 * of the game if synchronized mode is enabled.
 */
export const useGameStore = defineStore('game', () => {
  const router = useRouter();
  
  //Uses setup store
  // State
  const week = ref(0);
  const settingsLoaded = ref(false);
  /**
   * Whether a not the server is running in synchronized mode.
   * Synchronized mode means that the player can only progress to the next week when allowed by the admins.
   */
  const synchronized = ref<boolean | undefined>(undefined);
  const gameID = ref<number | undefined>(undefined);
  const bidsAccepted = ref<boolean | undefined>(undefined);
  const currentWeek = ref<number | undefined>(undefined);

  // Getters
  const decisionForm = computed(() => week.value + 1);

  // Actions

  /**
   * Progresses the week when the player is done with the decision form
   */
  function nextWeek() {
    week.value++;
  }

  // Logic
  async function connectWithDatabase() {
    const settingsRecord = (await collections.settings.getList(1, 1)).items[0];
    synchronized.value = settingsRecord.synchronized;
    if (synchronized.value) {
      gameID.value = settingsRecord.game_id;
      bidsAccepted.value = settingsRecord.bids_accepted;
      currentWeek.value = settingsRecord.allowed_weeks;

      collections.settings.subscribe(settingsRecord.id, (data) => {
        if (data.record.bids_accepted !== bidsAccepted.value) bidsAccepted.value = data.record.bids_accepted;
        if (data.record.allowed_weeks !== currentWeek.value) currentWeek.value = data.record.allowed_weeks;
      });

      routeCorrectly();
    }
    settingsLoaded.value = true;
  }

  function routeCorrectly() {
    if (!pocketbase.authStore.isValid && router.currentRoute.value.name !== 'auth') {
        router.push({ name: 'auth' });
      } else {
        if (router.currentRoute.value.name !== 'game' && bidsAccepted.value) router.push({ name: 'game' });
        if (router.currentRoute.value.name !== 'bid' && !bidsAccepted.value) router.push({ name: 'bid' });
      }
  }

  connectWithDatabase();

  return { week, decisionForm, nextWeek, synchronized, settingsLoaded, gameID, bidsAccepted, allowedWeeks: currentWeek, routeCorrectly };
});
