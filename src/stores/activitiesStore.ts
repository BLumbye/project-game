import { defineStore } from 'pinia';
import config from '../config';
import { Activity, ConfigActivity, WorkerType } from '../types/types';
import { createWeeklyTimeline, sumReducer } from '../utils/timeline';
import { ClientResponseError } from 'pocketbase';
import { collections, pocketbase, updateExistingOrCreate } from '~/pocketbase';

const generateProgressTimelines = () => {
  const timelines: Record<string, ReturnType<typeof createWeeklyTimeline<number>>> = {};
  for (const activity of config.activities) {
    timelines[activity.label] = createWeeklyTimeline(0, sumReducer, 0);
  }
  return timelines;
};

const generateAllocationState = () => {
  const allocations: Record<string, Record<WorkerType, number>[]> = {};
  for (const activity of config.activities) {
    allocations[activity.label] = Array.from({ length: config.duration + 1 }, () => ({
      labour: 0,
      skilled: 0,
      electrician: 0,
    }));
  }
  return allocations;
};

export const useActivitiesStore = defineStore('activities', () => {
  const gameStore = useGameStore();
  const workersStore = useWorkersStore();
  const equipmentStore = useEquipmentStore();

  // State
  const loading = ref(true);
  const progressTimelines = generateProgressTimelines();
  const allocations = ref(generateAllocationState());
  const weekActivityDone = ref<Record<string, number>>({}); //Which week an activity is done. If an activity is not in the record, it is not done.

  // Getters

  /**
   * Returns an array of all activites for a given week.
   * If no week is given, it returns for the current week.
   */
  const activitiesAtWeek = computed(() => {
    return (week?: number) => {
      week ??= gameStore.week;
      return config.activities.map((activity) => ({
        ...activity,
        progress: progressTimelines[activity.label].getReduced.value(week),
        allocation: allocations.value[activity.label][week!],
      })) satisfies Activity[];
    };
  });
  const activities = computed(() => activitiesAtWeek.value(gameStore.week));

  /**
   * Returns an activity from a given label.
   */
  const activityFromLabel = computed(() => {
    return (label: string, week?: number) => {
      week ??= gameStore.week;
      const configActivity = config.activities.find((activity) => activity.label === label);
      if (configActivity === undefined) throw new Error(`Activity with label ${label} not found`);
      return {
        ...configActivity,
        progress: progressTimelines[configActivity.label].getReduced.value(week),
        allocation: allocations.value[configActivity.label][week!],
      } satisfies Activity;
    };
  });

  /**
   * Returns true if an activity has finished in a given week.
   * If no week is given, it returns for the current week.
   */
  const isActivityDone = computed(() => {
    return (activity: Activity) => {
      return getDuration.value(activity) <= activity.progress;
    };
  });

  /**
   * Returns true if all activites are done in the given week.
   * If no week is given, it returns for the current week.
   */
  const allActivitiesDone = computed(() => {
    return (week?: number) => {
      week ??= gameStore.week;
      return activitiesAtWeek.value(week).every((activity) => isActivityDone.value(activity));
    };
  });

  /**
   * Returns the duration of an activity. The duration is the time needed for an activity to be completed.
   */
  const getDuration = computed(() => {
    return (activity: ConfigActivity, week?: number) => {
      week ??= gameStore.week;
      var durationModification = getEventDurationModification.value(activity, week);
      if (
        activity.expressDuration &&
        activity.requirements.equipment?.every(
          (equipment) => equipmentStore.equipment[equipment].deliveryType === 'express',
        )
      ) {
        return activity.expressDuration + durationModification;
      } else return activity.duration + durationModification;
    };
  });

  /**
   * Returns the total amount of workers assigned in a given week.
   * If no week is given, it returns for the current week.
   */
  const totalWorkersAssigned = computed(() => {
    return (type: WorkerType, week?: number) => {
      week ??= gameStore.week;
      return config.activities.reduce(
        (totalWorkers, activity) => totalWorkers + allocations.value[activity.label][week!][type],
        0,
      );
    };
  });

  /**
   * Returns true if the requirements for an activity to progress has been met for the given week.
   * An activity might need other activites to be done before it can begin.
   * If no week is given, it returns for the current week.
   */
  const activityRequirementMet = computed(() => {
    return (activity: Activity, week?: number) => {
      week ??= gameStore.week;
      return (
        !activity.requirements.activities ||
        activity.requirements.activities.every((requiredActivity) =>
          isActivityDone.value(activityFromLabel.value(requiredActivity, week)),
        )
      );
    };
  });

  /**
   * Returns true if the requirements for ordered equipment has been met for the given week.
   * Equipment must be ordered before it will progress.
   * If no week is given, it returns for the current week.
   */
  const equipmentRequirementMet = computed(() => {
    return (activity: Activity, week?: number) => {
      week ??= gameStore.week;
      if (!activity.requirements.equipment) return true;
      return activity.requirements.equipment.every(
        (requiredEquipment) => equipmentStore.equipmentAtWeek(week)[requiredEquipment]?.status !== 'unordered',
      );
    };
  });

  /**
   * Returns true if the given activity does not require workers or if there are anough workers allocated and hired.
   * If no week is given, it returns for the current week.
   */
  const workerRequirementMet = computed(() => {
    return (activity: Activity, week?: number) => {
      week ??= gameStore.week;

      var eventWorkersModification: Partial<Record<WorkerType, number>> = getEventWorkersModification.value(
        activity,
        week,
      );

      if (!activity.requirements.workers && !eventWorkersModification) return true;

      const enoughWorkers = (type: WorkerType) => {
        if ((!activity.requirements.workers || !activity.requirements.workers[type]) && !eventWorkersModification[type])
          return true;
        const enoughAssigned =
          (activity.requirements.workers ? activity.requirements.workers[type] || 0 : 0) +
            eventWorkersModification[type]! <=
          activity.allocation[type];
        const enoughHired = totalWorkersAssigned.value(type, week) <= workersStore.workersAtWeek(week)[type];
        return enoughAssigned && enoughHired;
      };

      return enoughWorkers('labour') && enoughWorkers('skilled') && enoughWorkers('electrician');
    };
  });

  /**
   * Returns true for a given week if all requirements for a given activity has been met:
   * 1) Prerequsite activites done
   * 2) Needed equipment has arrived
   * 3) Enough workers are hired and allocated.
   *
   * If no week is given, it returns for the current week.
   */
  const requirementsMet = computed(() => {
    return (activity: Activity, week?: number) => {
      week ??= gameStore.week;
      return (
        !!activity &&
        activityRequirementMet.value(activity, week) &&
        equipmentRequirementMet.value(activity, week) &&
        workerRequirementMet.value(activity, week)
      );
    };
  });

  // Actions

  /**
   * Allocates a worker to a given activity in the current week.
   */
  function allocateWorker(activity: string, type: WorkerType, value: number) {
    allocations.value[activity][gameStore.week][type] = value;
  }
  /**
   * Progresses each activity which meets its requirements.
   * An activity cannot progress if it already done.
   */
  function progressActivities() {
    for (const activity of activities.value) {
      if (!isActivityDone.value(activity) && requirementsMet.value(activity, gameStore.week)) {
        if (isActivityResourceDependant(activity)) {
          let max = getDuration.value(activity) - activity.progress;
          progressTimelines[activity.label].set(
            Math.min(max, getResourceDependancyMultiplier(activity)),
            gameStore.week + 1,
          );
        } else {
          progressTimelines[activity.label].set(1, gameStore.week + 1);
        }
        if (
          activity.requirements.equipment &&
          isActivityDone.value(activityFromLabel.value(activity.label, gameStore.week + 1))
        ) {
          const equipmentStore = useEquipmentStore();
          activity.requirements.equipment.forEach((equipment) => equipmentStore.finishDelivery(equipment));
        }
        if (isActivityDone.value(activityFromLabel.value(activity.label, gameStore.week + 1))) {
          weekActivityDone.value[activity.label] = gameStore.week + 1;
        }
      }
    }

    if (gameStore.synchronized) updateDatabase();
  }

  ///Events

  /**
   * Returns the duration modification of an activity based on events.
   * The duration modification is the time added or subtracted from the duration of an activity.
   */
  const getEventDurationModification = computed(() => {
    return (activity: ConfigActivity, week?: number) => {
      week ??= gameStore.week;
      let durationModification = 0;
      for (const event of config.events) {
        if (
          weekActivityDone.value[activity.label] !== undefined &&
          weekActivityDone.value[activity.label] <= event.week
        ) {
          continue;
        }
        if (event.week > week) continue;
        event.effects?.forEach((effect) => {
          if (effect.activityLabels.includes(activity.label) && effect.durationModification !== undefined) {
            durationModification += effect.durationModification;
          }
        });
      }
      return durationModification;
    };
  });

  /**
   * Returns the duration modification of an activity based on events.
   * The duration modification is the time added or subtracted from the duration of an activity.
   */
  const getEventWorkersModification = computed(() => {
    return (activity: ConfigActivity, week?: number) => {
      week ??= gameStore.week;
      let workersModification: Partial<Record<WorkerType, number>> = {
        labour: 0,
        skilled: 0,
        electrician: 0,
      };
      if (weekActivityDone.value[activity.label] !== undefined && weekActivityDone.value[activity.label] <= week) {
        return workersModification;
      }
      for (const event of config.events) {
        if (event.week > week) continue;
        event.effects?.forEach((effect) => {
          if (effect.activityLabels.includes(activity.label) && effect.workersModification !== undefined) {
            if (effect.workersModification.labour !== undefined && workersModification.labour !== undefined)
              workersModification.labour += effect.workersModification.labour;
            if (effect.workersModification.skilled !== undefined && workersModification.skilled !== undefined)
              workersModification.skilled += effect.workersModification.skilled;
            if (effect.workersModification.electrician !== undefined && workersModification.electrician !== undefined)
              workersModification.electrician += effect.workersModification.electrician;
          }
        });
      }
      return workersModification;
    };
  });

  function getResourceDependancyMultiplier(activity: Activity): number {
    let multiplier = Infinity;

    let workersRequired: Partial<Record<WorkerType, number>> = getEventWorkersModification.value(activity);
    workersRequired = {
      labour: (workersRequired.labour || 0) + (activity.requirements.workers?.labour || 0),
      skilled: (workersRequired.skilled || 0) + (activity.requirements.workers?.skilled || 0),
      electrician: (workersRequired.electrician || 0) + (activity.requirements.workers?.electrician || 0),
    };

    Object.entries(workersRequired).forEach(([key, value]) => {
      if (value !== 0) {
        multiplier = Math.min(multiplier, activity.allocation[key as unknown as WorkerType] / value);
      }
    });

    return Math.floor(multiplier);
  }

  function isActivityResourceDependant(activity: Activity, week?: number): boolean {
    week ??= gameStore.week;

    return config.events.some(
      (event) =>
        event.week <= week! &&
        event.effects?.some(
          (effect) => effect.activityLabels.includes(activity.label) && effect.resourceDependant === true,
        ),
    );
  }

  // Logic
  async function connectWithDatabase() {
    if (!gameStore.synchronized || !pocketbase.authStore.isValid || pocketbase.authStore.model!.admin) {
      loading.value = false;
      return;
    }

    // Get existing allocation from database
    try {
      const records = await collections.allocation.getFullList({
        filter: `user.username="${pocketbase.authStore.model!.username}"`,
      });
      for (let record of records) {
        allocations.value[record.activity][record.week][record.worker_type as WorkerType] = record.value || 0;
      }
    } catch (error) {
      if (!(error instanceof ClientResponseError) || error.status !== 404) {
        throw error;
      }
    }

    // Get existing progress from database
    try {
      const records = await collections.progress.getFullList({
        filter: `user.username="${pocketbase.authStore.model!.username}"`,
      });
      for (let record of records) {
        progressTimelines[record.activity].set(record.progress, record.week);
      }
    } catch (error) {
      if (!(error instanceof ClientResponseError) || error.status !== 404) {
        throw error;
      }
    }

    // Get existing activity completion from database
    try {
      const records = await collections.activityCompletion.getFullList({
        filter: `user.username="${pocketbase.authStore.model!.username}"`,
      });
      for (let record of records) {
        weekActivityDone.value[record.activity] = record.week;
      }
    } catch (error) {
      if (!(error instanceof ClientResponseError) || error.status !== 404) {
        throw error;
      }
    }

    loading.value = false;
  }

  async function updateDatabase() {
    activities.value.forEach((activity) => {
      // Update allocation
      ['labour', 'skilled', 'electrician'].forEach((type) => {
        updateExistingOrCreate(
          collections.allocation,
          `user.username="${pocketbase.authStore.model!.username}" && week=${gameStore.week} && activity="${
            activity.label
          }" && worker_type="${type}"`,
          {
            user: pocketbase.authStore.model!.id,
            game_id: gameStore.gameID,
            week: gameStore.week,
            activity: activity.label,
            worker_type: type,
            value: allocations.value[activity.label][gameStore.week][type as WorkerType],
          },
        );
      });

      // Update progress
      updateExistingOrCreate(
        collections.progress,
        `user.username="${pocketbase.authStore.model!.username}" && week=${gameStore.week} && activity="${
          activity.label
        }"`,
        {
          user: pocketbase.authStore.model!.id,
          game_id: gameStore.gameID,
          week: gameStore.week,
          activity: activity.label,
          progress: progressTimelines[activity.label].get.value(),
        },
      );

      // Update activity completion
      // TODO
    });
  }

  if (gameStore.settingsLoaded) {
    connectWithDatabase();
    // Every time the week progresses, elligible activities are progressed.
    watch(
      () => gameStore.ready,
      () => {
        if (gameStore.ready) progressActivities();
      },
    );
  } else {
    const synchronizedWatcher = watch(
      () => gameStore.settingsLoaded,
      () => {
        if (gameStore.settingsLoaded) synchronizedWatcher();
        connectWithDatabase();
        // Every time the week progresses, elligible activities are progressed.
        watch(
          () => gameStore.ready,
          () => {
            if (gameStore.ready) progressActivities();
          },
        );
      },
    );
  }

  return {
    loading,
    activitiesAtWeek,
    activities,
    activityFromLabel,
    isActivityDone,
    allActivitiesDone,
    getDuration,
    totalWorkersAssigned,
    workerRequirementMet,
    requirementsMet,
    allocateWorker,
    progressActivities,
    connectWithDatabase,
  };
});
