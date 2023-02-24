import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { WorkerType } from '../types/types';
import config from '../config';
import { useWeekStore } from './weekStore';

type WorkersState = Record<WorkerType, number>;

export const useWorkersStore = defineStore('workers', () => {
  // State
  const workers = ref(Array.from({ length: config.duration }, () => ({ labour: 0, skilled: 0, electrician: 0 })));

  // Getters
  const currentWorkers = computed(() => {
    const { week } = useWeekStore();
    const summedWorkers: WorkersState = {
      labour: 0,
      skilled: 0,
      electrician: 0,
    };
    for (let i = 0; i < week; i++) {
      summedWorkers.labour += workers.value[i].labour;
      summedWorkers.skilled += workers.value[i].skilled;
      summedWorkers.electrician += workers.value[i].electrician;
    }
    return summedWorkers;
  });

  // Actions
  function change(type: WorkerType, value: number) {
    const { week } = useWeekStore();
    workers.value[week][type] = value;
  }

  return { currentWorkers, change };
});
