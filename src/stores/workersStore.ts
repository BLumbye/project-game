import { defineStore } from 'pinia';
import config from '../config';
import { ClientResponseError } from 'pocketbase';
import { collections, pocketbase, updateExistingOrCreate } from '~/pocketbase';
import { useStorage } from '@vueuse/core';

type WorkersState = Record<string, number>;

export const useWorkersStore = defineStore('workers', () => {
  const gameStore = useGameStore();

  // State
  const loading = ref(true);
  const workers = useStorage(
    'workers',
    Array.from(
      { length: config.projectDuration + 1 },
      () => Object.keys(config.workers).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}) as WorkersState,
    ),
  );

  // Getters

  /**
   * Returns the total number of workers for a given week.
   * If no week is given, it returns for the current week.
   */
  const workersAtWeek = computed(() => {
    return (week?: number) => {
      week ??= useGameStore().week;
      const summedWorkers: WorkersState = Object.keys(config.workers).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
      for (let i = 0; i < week; i++) {
        for (let key in summedWorkers) {
          summedWorkers[key] += workers.value[i][key];
        }
      }
      return summedWorkers;
    };
  });

  /** Total workers for the current week */
  const currentWorkers = computed(() => workersAtWeek.value());

  // Actions

  /** Hires or fires an amount of workers of a given type.
   *  - Positive input hires
   *  - Negative input fires (cannot fire more workers than are already hired)
   */
  function change(type: string, value: number) {
    const { week } = useGameStore();
    workers.value[week][type] = Math.max(value, -currentWorkers.value[type]);
  }

  // Logic
  async function connectWithDatabase() {
    // DISABLED
    loading.value = false;
    return;

    // if (!gameStore.synchronized || !pocketbase.authStore.isValid || pocketbase.authStore.model!.admin) {
    //   loading.value = false;
    //   return;
    // }

    // // Get existing workers from database
    // try {
    //   const records = await collections.workers.getFullList({
    //     filter: `user.username="${pocketbase.authStore.model!.username}"`,
    //   });
    //   for (let record of records) {
    //     workers.value[record.week][record.worker_type] = record.change;
    //   }
    // } catch (error) {
    //   if (!(error instanceof ClientResponseError) || error.status !== 404) {
    //     throw error;
    //   }
    // }

    // watch(
    //   () => gameStore.ready,
    //   () => {
    //     if (gameStore.ready) updateDatabase();
    //   },
    // );

    // loading.value = false;
  }

  async function updateDatabase() {
    if (
      !gameStore.synchronized ||
      !pocketbase.authStore.isValid ||
      pocketbase.authStore.model!.admin ||
      gameStore.stopUpdates
    ) {
      loading.value = false;
      return;
    }

    Object.keys(config.workers).forEach((type) => {
      updateExistingOrCreate(
        collections.workers,
        `user.username="${pocketbase.authStore.model!.username}" && week=${gameStore.week} && worker_type="${type}"`,
        {
          user: pocketbase.authStore.model!.id,
          game_id: gameStore.gameID,
          week: gameStore.week,
          worker_type: type,
          change: workers.value[gameStore.week][type],
        },
      );
    });
  }

  if (gameStore.settingsLoaded) {
    connectWithDatabase();
  } else {
    const synchronizedWatcher = watch(
      () => gameStore.settingsLoaded,
      () => {
        if (gameStore.settingsLoaded) {
          synchronizedWatcher();
          connectWithDatabase();
        }
      },
    );
  }

  return {
    loading,
    workers,
    workersAtWeek,
    currentWorkers,
    change,
    updateDatabase,
    connectWithDatabase,
  };
});
