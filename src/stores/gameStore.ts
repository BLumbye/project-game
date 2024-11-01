import { defineStore } from 'pinia';
import { collections, isAdmin, pocketbase, updateExistingOrCreate } from '../pocketbase';
import { GameState } from '~/types/types';
import config from '~/config';
import { useStorage } from '@vueuse/core';

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
  const week = useStorage('week', 0);
  const maxWeek = ref<number | undefined>(undefined);
  const settingsLoaded = ref(false);
  const settingsRecordID = ref<string | undefined>(undefined);
  /**
   * Whether a not the server is running in synchronized mode.
   * Synchronized mode means that the player can only progress to the next week when allowed by the admins.
   */
  const synchronized = ref<boolean | undefined>(undefined);
  const gameID = useStorage<number>('gameID', -1);
  const gameState = ref<GameState | undefined>(undefined);
  const ready = ref(false);
  const gameWon = useStorage('gameWon', false);

  // Getters
  const decisionForm = computed(() => week.value + 1);

  const gameOver = computed(() => gameWon.value || week.value >= config.projectDuration);
  const stopUpdates = ref(false); //One final update before not updating server and sheets anymore.

  // Actions

  /**
   * Progresses the week when the player is done with the decision form
   */
  function nextWeek() {
    if (stopUpdates.value) return;
    activitiesStore.progressActivities();
    financeStore.applyWeeklyFinances();
    if (synchronized.value) {
      workersStore.updateDatabase();
      equipmentStore.updateDatabase();
    }
    week.value++;
    if (synchronized.value) {
      toggleReady(false);
      updateSummary();
    }
  }

  function toggleReady(value?: boolean) {
    ready.value = value ?? !ready.value;
    updateExistingOrCreate(collections.ready, `user.username="${pocketbase.authStore.model!.username}"`, {
      user: pocketbase.authStore.model!.id,
      game_id: gameID.value,
      week: week.value,
      ready: ready.value,
    });
  }

  // Logic
  async function connectWithDatabase() {
    const settingsRecord = (await collections.settings.getList(1, 1)).items[0];

    // Reset game if the game id is not the same as the one in the database
    if (gameID.value !== -1 && gameID.value !== settingsRecord.game_id) {
      localStorage.clear();
      window.location.reload();
    }

    synchronized.value = settingsRecord.synchronized;
    settingsRecordID.value = settingsRecord.id;
    gameID.value = settingsRecord.game_id;
    maxWeek.value = settingsRecord.current_week;
    if (synchronized.value) {
      gameState.value = settingsRecord.game_state;
    }

    if (!synchronized.value && pocketbase.authStore.isValid && !pocketbase.authStore.model?.admin) {
      pocketbase.authStore.clear();
    }

    collections.settings.subscribe(settingsRecord.id, (data) => {
      if (data.record.synchronized !== synchronized.value) synchronized.value = data.record.synchronized;
      if (data.record.game_id !== gameID.value) gameID.value = data.record.game_id;
      if (data.record.game_state !== gameState.value) gameState.value = data.record.game_state;
      if (data.record.current_week !== maxWeek.value) {
        maxWeek.value = data.record.current_week;
        if (synchronized.value && ready.value && week.value < maxWeek.value!) {
          nextWeek();
        }
      }
      // if (data.record.current_week !== week.value) {
      //   if (isAdmin()) {
      //     week.value = data.record.current_week;
      //   } else {
      //     for (let i = week.value; i < data.record.current_week; i++) {
      //       nextWeek();
      //     }
      //   }
      // }
    });

    // if (synchronized.value && !isAdmin()) {
    //   if (
    //     !activitiesStore.loading &&
    //     !financeStore.loading &&
    //     !workersStore.loading &&
    //     !equipmentStore.loading &&
    //     !bidStore.loading
    //   ) {
    //     fastForward(settingsRecord.current_week);
    //   } else {
    //     const loadWatcher = watchEffect(() => {
    //       if (
    //         !activitiesStore.loading &&
    //         !financeStore.loading &&
    //         !workersStore.loading &&
    //         !equipmentStore.loading &&
    //         !bidStore.loading
    //       ) {
    //         loadWatcher();
    //         fastForward(settingsRecord.current_week);
    //       }
    //     });
    //   }
    // } else if (synchronized.value) {
    //   week.value = settingsRecord.current_week;
    // }

    updateSummary();

    settingsLoaded.value = true;
  }

  // /**
  //  * If the user has been disconnected, this will calculate finances and activities for the weeks that have been missed.
  //  */
  // async function fastForward(gameWeek: number) {
  //   let lastWeekOnline = 0;
  //   let isReady = false;
  //   try {
  //     const readyRecord = await collections.ready.getFirstListItem(
  //       `user.username="${pocketbase.authStore.model!.username}"`,
  //     );
  //     lastWeekOnline = readyRecord.week;
  //     isReady = readyRecord.ready;
  //   } catch (error) {
  //     if (error instanceof ClientResponseError && error.status !== 404) {
  //       throw error;
  //     }
  //   }

  //   week.value = lastWeekOnline;
  //   for (let i = week.value; i < gameWeek; i++) {
  //     nextWeek();
  //   }
  //   ready.value = isReady;
  // }

  function updateSummary() {
    if (!synchronized.value || !pocketbase.authStore.isValid || isAdmin()) return;

    console.log('updating summary', gameOver.value ? (gameWon.value ? 'won' : 'lost') : 'playing');
    updateExistingOrCreate(collections.gameSummary, `user.username="${pocketbase.authStore.model!.username}"`, {
      user: pocketbase.authStore.model!.id,
      game_id: gameID.value,
      week: week.value,
      total_balance: financeStore.balanceAtWeek(),
      total_loaned: financeStore.loanTimeline.getReduced(),
      total_repaid: financeStore.loanRepayTimeline.getReduced(),
      status: gameOver.value ? (gameWon.value ? 'won' : 'lost') : 'playing',
    });
  }

  function routeCorrectly() {
    if (synchronized.value && !pocketbase.authStore.isValid && router.currentRoute.value.name !== 'auth')
      router.push({ name: 'auth' });
    else if (router.currentRoute.value.name !== 'admin' && isAdmin()) router.push({ name: 'admin' });
    else if (router.currentRoute.value.name !== 'game' && synchronized.value && !isAdmin())
      router.push({ name: 'game' });
  }

  function connectAllDatabases() {
    activitiesStore.connectWithDatabase();
    financeStore.connectWithDatabase();
    workersStore.connectWithDatabase();
    equipmentStore.connectWithDatabase();
    bidStore.connectWithDatabase();
  }

  connectWithDatabase();

  watchEffect(() => {
    const noWorkers = Object.values(workersStore.currentWorkers).every((worker) => worker === 0);
    const activitiesDone = activitiesStore.allActivitiesDone();
    const loanRepaid = !financeStore.hasActiveLoan();

    gameWon.value = noWorkers && activitiesDone && loanRepaid;
  });

  watch(
    () => gameWon.value,
    () => {
      if (gameWon.value) {
        activitiesStore.progressActivities();
        financeStore.applyWeeklyFinances();
        workersStore.updateDatabase();
        equipmentStore.updateDatabase();
        updateSummary();
        stopUpdates.value = true;
      }
    },
  );

  return {
    week,
    maxWeek,
    decisionForm,
    ready,
    synchronized,
    settingsLoaded,
    settingsRecordID,
    gameID,
    gameState,
    gameWon,
    gameOver,
    stopUpdates,
    nextWeek,
    toggleReady,
    routeCorrectly,
    connectWithDatabase,
    connectAllDatabases,
  };
});
