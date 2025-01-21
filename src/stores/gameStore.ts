import { defineStore } from 'pinia';
import { collections, Games, isAdmin, pocketbase, Settings, updateExistingOrCreate } from '../pocketbase';
import { useStorage } from '@vueuse/core';

/**
 * This store contains overall information about the game, and also controls the flow
 * of the game if synchronized mode is enabled.
 * ! It is important that this store does not use any other stores in the setup, as they are not yet initialized and depend on this store being initialized.
 * ! Likewise, it is important that this store is the very first to be initialized, and that no others are initialized asynchronously meanwhile this one is not fully initialized.
 */
export const useGameStore = defineStore('game', () => {
  const router = useRouter();

  //Uses setup store
  // State
  const game = ref<Games | undefined>();
  const settings = ref<Settings | undefined>();
  const week = useStorage('week', 0);
  const loaded = ref(false);
  /**
   * Whether a not the server is running in synchronized mode or the user is in freeplay mode.
   * Synchronized mode means that the player can only progress to the next week when allowed by the admins.
   */
  const synchronized = ref<boolean | undefined>(undefined);
  const ready = ref(false);
  const gameWon = useStorage('gameWon', false);

  // Getters
  const decisionForm = computed(() => week.value + 1);
  const config = computed(() => {
    if (synchronized.value) {
      return game.value!.config;
    } else {
      return settings.value!.freeplay_config;
    }
  });

  initialize();

  const gameOver = computed(() => gameWon.value || week.value >= config.value.projectDuration);
  const stopUpdates = ref(false); //One final update before not updating server and sheets anymore.

  // Actions

  /**
   * Progresses the week when the player is done with the decision form
   */
  function nextWeek() {
    if (stopUpdates.value) return;
    useActivitiesStore().progressActivities();
    useFinanceStore().applyWeeklyFinances();
    if (synchronized.value) {
      useWorkersStore().updateDatabase();
      useEquipmentStore().updateDatabase();
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
      game_id: game.value!.game_id,
      week: week.value,
      ready: ready.value,
    });
  }

  // Logic
  async function initialize() {
    if (pocketbase.authStore.isValid) {
      synchronized.value = true;
      await connectWithDatabase();
    } else {
      if (import.meta.env.MODE === 'development') {
        synchronized.value = false;
      } else {
        try {
          await collections.games.getFirstListItem('game_state != "finished"');

          // A game is in progress, so unauthorized users should not be in a game
          localStorage.clear();
          router.push('/');
          return;
        } catch (error) {
          // User is playing in freeplay mode
          synchronized.value = false;
        }
      }

      settings.value = (await collections.settings.getList(1, 1)).items[0];
      settings.value.freeplay_config.workers = Object.fromEntries(
        Object.entries(settings.value.freeplay_config.workers).sort((a, b) => a[1].order - b[1].order),
      );
      settings.value.freeplay_config.equipment = Object.fromEntries(
        Object.entries(settings.value.freeplay_config.equipment).sort((a, b) => a[1].order - b[1].order),
      );
      await initializeStores();
    }

    loaded.value = true;
  }

  async function connectWithDatabase() {
    // Get game from database
    game.value = (await collections.games.getFirstListItem(`game_id=${pocketbase.authStore.model!.game_id}`))!;
    game.value.config.workers = Object.fromEntries(
      Object.entries(game.value.config.workers).sort((a, b) => a[1].order - b[1].order),
    );
    game.value.config.equipment = Object.fromEntries(
      Object.entries(game.value.config.equipment).sort((a, b) => a[1].order - b[1].order),
    );

    synchronized.value = true;

    collections.games.subscribe(game.value.id, (data) => {
      game.value = data.record;
      game.value.config.workers = Object.fromEntries(
        Object.entries(game.value.config.workers).sort((a, b) => a[1].order - b[1].order),
      );
      game.value.config.equipment = Object.fromEntries(
        Object.entries(game.value.config.equipment).sort((a, b) => a[1].order - b[1].order),
      );
      if (ready.value && week.value < data.record.current_week) {
        nextWeek();
      }
    });

    await connectAllDatabases();
    await updateSummary();
  }

  async function updateSummary() {
    if (!synchronized.value || !pocketbase.authStore.isValid || isAdmin()) return;

    const financeStore = useFinanceStore();

    await updateExistingOrCreate(collections.gameSummary, `user.username="${pocketbase.authStore.model!.username}"`, {
      user: pocketbase.authStore.model!.id,
      game_id: game.value!.game_id,
      week: week.value,
      total_balance: financeStore.balanceAtWeek(week.value + 1),
      total_loaned: financeStore.loanTimeline.getReduced(),
      total_repaid: financeStore.loanRepayTimeline.getReduced(),
      status: gameOver.value ? (gameWon.value ? 'won' : 'lost') : 'playing',
    });
  }

  async function initializeStores() {
    await useWorkersStore().initialize(config.value);
    await useEquipmentStore();
    await useActivitiesStore();
    await useFinanceStore();
    await useBidStore();
  }

  async function connectAllDatabases() {
    await initializeStores();
    await Promise.all([
      useActivitiesStore().connectWithDatabase(),
      useFinanceStore().connectWithDatabase(),
      useWorkersStore().connectWithDatabase(),
      useEquipmentStore().connectWithDatabase(),
      useBidStore().connectWithDatabase(),
    ]);
  }

  watchEffect(() => {
    if (!loaded.value) return;
    const noWorkers = Object.values(useWorkersStore().currentWorkers).every((worker) => worker === 0);
    const activitiesDone = useActivitiesStore().allActivitiesDone();
    const loanRepaid = !useFinanceStore().hasActiveLoan();

    gameWon.value = noWorkers && activitiesDone && loanRepaid;
  });

  watch(
    () => gameWon.value,
    () => {
      if (gameWon.value) {
        useActivitiesStore().progressActivities();
        useFinanceStore().applyWeeklyFinances();
        useWorkersStore().updateDatabase();
        useEquipmentStore().updateDatabase();
        updateSummary();
        stopUpdates.value = true;
      }
    },
  );

  return {
    game,
    config,
    week,
    decisionForm,
    ready,
    synchronized,
    loaded,
    gameWon,
    gameOver,
    stopUpdates,
    nextWeek,
    toggleReady,
  };
});
