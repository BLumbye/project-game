import { defineStore } from 'pinia';
import { Activity, WorkerType } from '../types/types';

export const useActivitiesStore = defineStore('activities', {
  state: (): { activities: Activity[] } => ({
    activities: [
      {
        label: 'A',
        duration: () => 2,
        progress: 0,
        requirements: {
          equipment: ['steelwork'],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'B',
        duration: () => 3,
        progress: 0,
        requirements: {
          equipment: ['interior'],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'C',
        duration: () => 5,
        progress: 0,
        requirements: {
          equipment: ['tbs'],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'D',
        duration: () => 1,
        progress: 0,
        requirements: {},
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'E',
        duration: () => 3,
        progress: 0,
        requirements: {
          workers: {
            labour: 6,
          },
          activities: ['D'],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'F',
        duration: () => 1,
        progress: 0,
        requirements: {
          workers: {
            labour: 4,
          },
          activities: ['D'],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'G',
        duration: () => 3,
        progress: 0,
        requirements: {
          workers: {
            labour: 4,
          },
          activities: ['E'],
          equipment: [],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'H',
        duration: () => 2,
        progress: 0,
        requirements: {
          workers: {
            labour: 2,
            skilled: 4,
          },
          activities: ['A', 'F'],
          equipment: [],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'I',
        duration: () => 1,
        progress: 0,
        requirements: {
          workers: {
            labour: 1,
            skilled: 4,
          },
          activities: ['B', 'H'],
          equipment: [],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'J',
        duration: () => 1,
        progress: 0,
        requirements: {
          workers: {
            labour: 4,
            skilled: 3,
          },
          activities: ['H'],
          equipment: [],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'K',
        duration: () => 2,
        progress: 0,
        requirements: {
          workers: {
            labour: 4,
            skilled: 2,
            electrician: 8,
          },
          activities: ['C', 'I'],
          equipment: [],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
      {
        label: 'L',
        duration: () => 1,
        progress: 0,
        requirements: {
          workers: {
            labour: 2,
            skilled: 2,
          },
          activities: ['C', 'K'],
          equipment: [],
        },
        allocation: {
          labour: 0,
          skilled: 0,
          electrician: 0,
        },
      },
    ],
  }),
  getters: {
    isActivityDone: (state) => {
      return (label: string) => {
        const activity = state.activities.find((activity) => activity.label === label);
        return activity !== undefined && activity?.duration() <= activity?.progress;
      };
    },
    allActivitiesDone: (state) => {
      return state.activities.every((activity) => activity.duration() <= activity.progress);
    },
    requirementsMet: (state) => {
      return (label: string) => {
        // TODO: Implement this
        return true;
      };
    },
  },
  actions: {
    allocateWorkers(label: string, workers: Record<WorkerType, number>) {
      const activity = this.activities.find((activity) => activity.label === label);
      if (activity === undefined) return;
      activity.allocation = workers;
    },
    progressActivities() {
      // TODO: Implement this
    },
  },
});
