import { defineStore } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { collections, pocketbase, updateExistingOrCreate } from '../pocketbase';
import { GameState } from '~/types/types';

/**
 * This store contains overall information about the game, and also controls the flow
 * of the game if synchronized mode is enabled.
 */
export const useGameStore = defineStore('game', () => {
  const router = useRouter();
  const bidStore = useBidStore();
  const activitiesStore = useActivitiesStore();
  const financeStore = useFinanceStore();
  const workersStore = useWorkersStore();
  const equipmentStore = useEquipmentStore();

  //Uses setup store
  // State
  const week = ref(0);
  const settingsLoaded = ref(false);
  const settingsRecordID = ref<string | undefined>(undefined);
  /**
   * Whether a not the server is running in synchronized mode.
   * Synchronized mode means that the player can only progress to the next week when allowed by the admins.
   */
  const synchronized = ref<boolean | undefined>(undefined);
  const gameID = ref<number | undefined>(undefined);
  const gameState = ref<GameState | undefined>(undefined);
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
    settingsRecordID.value = settingsRecord.id;
    gameID.value = settingsRecord.game_id;
    if (synchronized.value) {
      gameState.value = settingsRecord.game_state;
      week.value = settingsRecord.current_week;

      routeCorrectly();
    }

    if (!synchronized.value && pocketbase.authStore.isValid && !pocketbase.authStore.model?.admin) {
      pocketbase.authStore.clear();
    }

    collections.settings.subscribe(settingsRecord.id, (data) => {
      if (data.record.synchronized !== synchronized.value) synchronized.value = data.record.synchronized;
      if (data.record.game_id !== gameID.value) gameID.value = data.record.game_id;
      if (data.record.game_state !== gameState.value) gameState.value = data.record.game_state;
      if (data.record.current_week !== week.value) {
        for (let i = week.value; i < data.record.current_week; i++) {
          if (!ready.value) nextWeek();
          else week.value++;
          ready.value = false;
        }
      }
    });

    settingsLoaded.value = true;
  }

  function routeCorrectly() {
    if (!pocketbase.authStore.isValid && router.currentRoute.value.name !== 'auth') router.push({ name: 'auth' });
    else if (router.currentRoute.value.name !== 'admin' && pocketbase.authStore.model?.admin)
      router.push({ name: 'admin' });
    else if (router.currentRoute.value.name !== 'game' && synchronized.value) router.push({ name: 'game' });
  }

  function connectAllDatabases() {
    activitiesStore.connectWithDatabase();
    financeStore.connectWithDatabase();
    workersStore.connectWithDatabase();
    equipmentStore.connectWithDatabase();
    bidStore.connectWithDatabase();
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
    settingsRecordID,
    gameID,
    gameState,
    routeCorrectly,
    connectWithDatabase,
    connectAllDatabases,
  };
});
