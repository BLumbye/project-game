import { defineStore } from 'pinia';
import { EquipmentType, Equipment, DeliveryType, EquipmentStatus } from '../types/types';
import { mergeDeep } from '../utils/merge';
import { ClientResponseError } from 'pocketbase';
import { collections, pocketbase, updateExistingOrCreate } from '~/pocketbase';
import { createWeeklyTimeline } from '~/utils/timeline';

type EquipmentState = Record<EquipmentType, Equipment>;

export const useEquipmentStore = defineStore('equipment', () => {
  const gameStore = useGameStore();

  // State
  const loading = ref(true);
  /**
   * Equipment starts out as unordered.
   */
  const defaultState: EquipmentState = {
    steelwork: { status: 'unordered' },
    interior: { status: 'unordered' },
    tbs: { status: 'unordered' },
  };
  const timeline = createWeeklyTimeline<Partial<Record<EquipmentType, Partial<Equipment>>>>(
    {},
    (accumulator, current) => mergeDeep(accumulator, current),
    defaultState,
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
  function setDeliveryStatus(type: EquipmentType, status: EquipmentStatus, deliveryType?: DeliveryType, week?: number) {
    deliveryType ??= equipment.value[type].deliveryType;
    timeline.set(
      { ...timeline.get.value(week), [type]: { ...timeline.getReduced.value(week)![type], status, deliveryType } },
      week,
    );
  }

  // Logic
  async function connectWithDatabase() {
    if (!gameStore.synchronized || !pocketbase.authStore.isValid || pocketbase.authStore.model!.admin) {
      loading.value = false;
      return;
    }

    // Get existing equipment from database
    try {
      const records = await collections.equipment.getFullList({
        filter: `user.username="${pocketbase.authStore.model!.username}"`,
      });
      for (let record of records) {
        timeline.set(
          {
            ...timeline.get.value(record.week),
            [record.equipment_type]: { status: record.status, deliveryType: record.delivery_type },
          },
          record.week,
        );
      }
    } catch (error) {
      if (!(error instanceof ClientResponseError) || error.status !== 404) {
        throw error;
      }
    }

    watch(
      () => gameStore.ready,
      () => {
        if (gameStore.ready) updateDatabase();
      },
    );

    loading.value = false;
  }

  async function updateDatabase() {
    if (!gameStore.synchronized || !pocketbase.authStore.isValid || pocketbase.authStore.model!.admin) {
      loading.value = false;
      return;
    }

    if (!timeline.get.value()) return;
    ['steelwork', 'interior', 'tbs'].forEach((type) => {
      updateExistingOrCreate(
        collections.equipment,
        `user.username="${pocketbase.authStore.model!.username}" && week=${gameStore.week} && equipment_type="${type}"`,
        {
          user: pocketbase.authStore.model!.id,
          game_id: gameStore.gameID,
          week: gameStore.week,
          equipment_type: type,
          status:
            timeline.get.value()![type as EquipmentType]?.status ||
            timeline.getReduced.value()[type as EquipmentType]?.status,
          delivery_type:
            timeline.get.value()![type as EquipmentType]?.deliveryType ||
            timeline.getReduced.value()[type as EquipmentType]?.deliveryType ||
            null,
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
    equipmentAtWeek: timeline.getReduced as globalThis.ComputedRef<(week?: number) => Record<EquipmentType, Equipment>>,
    setDeliveryStatus,
    updateDatabase,
    connectWithDatabase,
  };
});
