import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { EquipmentType, Equipment, DeliveryType } from '../types/types';
import { mergeDeep } from '../utils/merge';
import { useWeekStore } from './weekStore';

type EquipmentState = Record<EquipmentType, Equipment>;

export const useEquipmentStore = defineStore('equipment', () => {
  const weekStore = useWeekStore();

  // State

  /**
   * Equipment starts out as unordered.
   */
  const defaultState: EquipmentState = {
    steelwork: { status: 'unordered' },
    interior: { status: 'unordered' },
    tbs: { status: 'unordered' },
  };
  const timeline = ref<Partial<Record<EquipmentType, Partial<Equipment>>>[]>([]);

  // Getters

  /**
   * Returns equipment for a given week.
   * If no week is given, it returns for the current week.
   */
  const equipmentAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week;
      return timeline.value
        .slice(0, week + 1)
        .reduce((accumulator, current) => mergeDeep(accumulator, current), structuredClone(defaultState)) as Record<
        EquipmentType,
        Equipment
      >;
    };
  });

  /**
   * Returns equipment for the current week.
   */
  const equipment = computed(() => equipmentAtWeek.value(weekStore.week));

  // Actions
  function populateTimeline() {
    for (let i = timeline.value.length; i <= weekStore.week; i++) {
      timeline.value.push({});
    }
  }

  /**
   * Sets the given equipment's status to 'ordered' Can be normal or express based on @DeliveryType
   */
  function order(type: EquipmentType, deliveryType: DeliveryType) {
    populateTimeline();
    timeline.value[weekStore.week][type] = { status: 'ordered', deliveryType };
  }

  /**
   * Cancels the order for the given equipment
   */
  function unorder(type: EquipmentType) {
    populateTimeline();
    delete timeline.value[weekStore.week][type];
  }

  /**
   * Sets the status of an equipment to 'delivered' which completes the delivery.
   */
  function finishDelivery(type: EquipmentType) {
    populateTimeline();
    timeline.value[weekStore.week][type] = { status: 'delivered' };
  }

  return { timeline, equipment, equipmentAtWeek, order, unorder, finishDelivery };
});
