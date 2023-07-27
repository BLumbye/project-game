import { defineStore } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { collections, pocketbase, updateExistingOrCreate } from '../pocketbase';

/**
 * This store contains overall information about the game, and also controls the flow
 * of the game if synchronized mode is enabled.
 */
export const useGameStore = defineStore('game', () => {
  const router = useRouter();
  const activitiesStore = useActivitiesStore();
  const financeStore = useFinanceStore();
  const workersStore = useWorkersStore();
  const equipmentStore = useEquipmentStore();

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
  const ready = ref(false);

  // Getters
  const decisionForm = computed(() => week.value + 1);

  // Actions

  /**
   * Progresses the week when the player is done with the decision form
   */
  function nextWeek() {
    activitiesStore.progressActivities();
    financeStore.applyWeeklyFinances();
    if (synchronized.value) {
      workersStore.updateDatabase();
      equipmentStore.updateDatabase();
    }
    week.value++;
  }

  function toggleReady() {
    ready.value = !ready.value;
    updateExistingOrCreate(
      collections.ready,
      `user.username="${pocketbase.authStore.model!.username}" && week=${week.value}`,
      {
        user: pocketbase.authStore.model!.id,
        game_id: gameID.value,
        week: week.value,
        ready: ready.value,
      },
    );
  }

  // Logic
  async function connectWithDatabase() {
    const settingsRecord = (await collections.settings.getList(1, 1)).items[0];
    synchronized.value = settingsRecord.synchronized;
    if (synchronized.value) {
      gameID.value = settingsRecord.game_id;
      bidsAccepted.value = settingsRecord.bids_accepted;
      week.value = settingsRecord.current_week;

      collections.settings.subscribe(settingsRecord.id, (data) => {
        if (data.record.bids_accepted !== bidsAccepted.value) bidsAccepted.value = data.record.bids_accepted;
        if (data.record.current_week !== week.value) {
          for (let i = week.value; i < data.record.current_week; i++) {
            ready.value = false;
            nextWeek();
          }
        }
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

  return {
    week,
    decisionForm,
    ready,
    nextWeek,
    toggleReady,
    synchronized,
    settingsLoaded,
    gameID,
    bidsAccepted,
    routeCorrectly,
  };
});
