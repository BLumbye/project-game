import { defineStore } from 'pinia';
import { WorkerType } from '../types/types';

type WorkersState = Record<WorkerType, number>;

export const useWorkersStore = defineStore('workers', {
  state: (): WorkersState => ({
    labour: 0,
    skilled: 0,
    electrician: 0,
  }),
  actions: {
    change(type: WorkerType, difference: number) {
      // TODO: Handle people trying to have negative workers
      this[type] += difference; //this['electrician'] += difference;
    },
  },
});
