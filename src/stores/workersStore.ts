import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { WorkerType } from '../types/types';
import config from '../config';
import { useWeekStore } from './weekStore';
import { createTimeline, createWeeklyTimeline, sumReducer } from '../utils/timeline';

type WorkersState = Record<WorkerType, number>;

export const useWorkersStore = defineStore('workers', () => {
  // State
  const workers = ref(Array.from({ length: config.duration + 1 }, () => ({ labour: 0, skilled: 0, electrician: 0 })));

  // Getters

  /**
   * Returns the total number of workers for a given week.
   * If no week is given, it returns for the current week.
   */
  const workersAtWeek = computed(() => {
    return (week?: number) => {
      week ??= useWeekStore().week;
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
    };
  });

  /** Total workers for the current week */
  const currentWorkers = computed(() => workersAtWeek.value());

  // Actions

  /** Hires or fires an amount of workers of a given type.
   *  - Positive input hires
   *  - Negative input fires (cannot fire more workers than are already hired)
   */
  function change(type: WorkerType, value: number) {
    const { week } = useWeekStore();
    workers.value[week][type] = Math.max(value, -currentWorkers.value[type]);
  }

  return {
    workersAtWeek,
    currentWorkers,
    change,
  };
});
