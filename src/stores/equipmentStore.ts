import { defineStore } from 'pinia';
import { merge } from 'ts-deepmerge';
import { Equipment, DeliveryType, EquipmentStatus } from '../types/types';
import { collections, pocketbase, updateExistingOrCreate } from '~/pocketbase';
import { createWeeklyTimeline } from '~/utils/timeline';
import config from '~/config';

type EquipmentState = Record<string, Equipment>;

export const useEquipmentStore = defineStore('equipment', () => {
  const gameStore = useGameStore();

  // State
  const loading = ref(true);
  const timeline = createWeeklyTimeline<Partial<Record<string, Partial<Equipment>>>>(
    'equipment',
    {},
    (accumulator, current) => merge(accumulator, current),
    Object.keys(config.equipment).reduce(
      (accumulator, type) => ({ ...accumulator, [type]: { status: 'unordered' } }),
      {},
    ) as EquipmentState,
  );

  // Getters
  /**
   * Returns equipment for the current week.
   */
  const equipment = computed(() => timeline.getReduced.value(gameStore.week) as EquipmentState);

  // Actions
  /**
   * Sets the status of an equipment to 'delivered' which completes the delivery.
   */
  function setDeliveryStatus(type: string, status: EquipmentStatus, deliveryType?: DeliveryType, week?: number) {
    deliveryType ??= equipment.value[type].deliveryType;
    timeline.set(
      { ...timeline.get.value(week), [type]: { ...timeline.getReduced.value(week)![type], status, deliveryType } },
      week,
    );
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

    // // Get existing equipment from database
    // try {
    //   const records = await collections.equipment.getFullList({
    //     filter: `user.username="${pocketbase.authStore.model!.username}"`,
    //   });
    //   for (let record of records) {
    //     timeline.set(
    //       {
    //         ...timeline.get.value(record.week),
    //         [record.equipment_type]: { status: record.status, deliveryType: record.delivery_type },
    //       },
    //       record.week,
    //     );
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

    if (!timeline.get.value()) return;
    Object.keys(config.equipment).forEach((type) => {
      updateExistingOrCreate(
        collections.equipment,
        `user.username="${pocketbase.authStore.model!.username}" && week=${gameStore.week} && equipment_type="${type}"`,
        {
          user: pocketbase.authStore.model!.id,
          game_id: gameStore.gameID,
          week: gameStore.week,
          equipment_type: type,
          status: timeline.get.value()![type]?.status || timeline.getReduced.value()[type]?.status,
          delivery_type:
            timeline.get.value()![type]?.deliveryType || timeline.getReduced.value()[type]?.deliveryType || null,
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
    timeline,
    equipment,
    equipmentAtWeek: timeline.getReduced as globalThis.ComputedRef<(week?: number) => Record<string, Equipment>>,
    setDeliveryStatus,
    updateDatabase,
    connectWithDatabase,
  };
});
