import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { EquipmentType, Equipment, DeliveryType } from '../types/types';
import { mergeDeep } from '../utils/merge';
import { useWeekStore } from './weekStore';

type EquipmentState = Record<EquipmentType, Equipment>;

export const useEquipmentStore = defineStore('equipment', () => {
  const weekStore = useWeekStore();

  // State
  const defaultState: EquipmentState = {
    steelwork: { status: 'unordered' },
    interior: { status: 'unordered' },
    tbs: { status: 'unordered' },
  };
  const timeline = ref<Partial<Record<EquipmentType, Partial<Equipment>>>[]>([]);

  // Getters
  const equipmentAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week;
      return timeline.value
        .slice(0, week)
        .reduce((accumulator, current) => mergeDeep(accumulator, current), defaultState);
    };
  });

  const equipment = computed(() => equipmentAtWeek.value());

  // Actions
  function populateTimeline() {
    for (let i = timeline.value.length; i <= weekStore.week; i++) {
      timeline.value.push({});
    }
  }

  function order(type: EquipmentType, deliveryType: DeliveryType) {
    populateTimeline();
    timeline.value[weekStore.week][type] = { status: 'ordered', deliveryType };
  }

  function unorder(type: EquipmentType) {
    populateTimeline();
    delete timeline.value[weekStore.week][type];
  }

  function finishDelivery(type: EquipmentType) {
    populateTimeline();
    timeline.value[weekStore.week][type] = { status: 'delivered' };
  }

  return { equipment, equipmentAtWeek, order, unorder, finishDelivery };
});
