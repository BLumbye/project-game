import { defineStore } from 'pinia';
import { collections, pocketbase, updateExistingOrCreate } from '../pocketbase';
import { GameState } from '~/types/types';
import config from '~/config';

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
  const settingsLoaded = ref(true);
  const settingsRecordID = ref<string | undefined>(undefined);
  /**
   * Whether a not the server is running in synchronized mode.
   * Synchronized mode means that the player can only progress to the next week when allowed by the admins.
   */
  const synchronized = ref<boolean | undefined>(false);
  const gameID = ref<number | undefined>(undefined);
  const gameState = ref<GameState | undefined>(undefined);
  const ready = ref(false);
  const gameWon = ref(false);

  // Getters
  const decisionForm = computed(() => week.value + 1);
  const gameOver = computed(() => gameWon.value || week.value >= config.duration);

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

  function connectAllDatabases() {
    activitiesStore.connectWithDatabase();
    financeStore.connectWithDatabase();
    workersStore.connectWithDatabase();
    equipmentStore.connectWithDatabase();
    bidStore.connectWithDatabase();
  }

  watchEffect(() => {
    const noWorkers = Object.values(workersStore.currentWorkers).every((worker) => worker === 0);
    const activitiesDone = activitiesStore.allActivitiesDone();
    const loanRepaid = financeStore.loan === 0;

    gameWon.value = noWorkers && activitiesDone && loanRepaid;
  });

  //connectWithDatabase();

  return {
    week,
    decisionForm,
    ready,
    synchronized,
    settingsLoaded,
    settingsRecordID,
    gameID,
    gameState,
    gameWon,
    gameOver,
    nextWeek,
    toggleReady,
    connectWithDatabase,
    connectAllDatabases,
  };
});
