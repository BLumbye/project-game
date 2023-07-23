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
  /**
   * Whether a not the server is running in synchronized mode.
   * Synchronized mode means that the player can only progress to the next week when allowed by the admins.
   */
  const { state: settingsState, isReady: settingsReady } = useAsyncState<{ synchronized: boolean | undefined, gameID: number | undefined }>(collections.settings.getList(1, 1).then(result => ({ synchronized: result.items[0].synchronized, gameID: result.items[0].game_id })), { synchronized: undefined, gameID: undefined });
  const bidsAccepted = ref(undefined);
  const allowedWeeks = ref(undefined);

  // Getters
  const decisionForm = computed(() => week.value + 1);
  const synchronized = computed(() => settingsState.value.synchronized);
  const gameID = computed(() => settingsState.value.gameID);

  // Actions

  /**
   * Progresses the week when the player is done with the decision form
   */
  function nextWeek() {
    week.value++;
  }

  // Logic
  const synchronizedWatcher = watch(synchronized, (synchronized) => {
    if (settingsReady.value) synchronizedWatcher();

    if (synchronized) {
      collections.settings.getList(1, 1).then(result => {
        collections.settings.subscribe(result.items[0].id, (data) => {
          if (data.record['bids_accepted'] !== bidsAccepted.value) bidsAccepted.value = data.record['bids_accepted'];
          if (data.record['allowed_weeks'] !== allowedWeeks.value) allowedWeeks.value = data.record['allowed_weeks'];
        });
      });
    }
  });

  return { week, decisionForm, nextWeek, synchronized, settingsReady, gameID, bidsAccepted, allowedWeeks };
});
