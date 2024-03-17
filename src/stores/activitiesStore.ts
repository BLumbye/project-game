import { defineStore } from 'pinia';
import config from '../config';
import { Activity, ConfigActivity, EventEffect } from '../types/types';
import { createWeeklyTimeline, sumReducer } from '../utils/timeline';
import { collections, deleteExisting, pocketbase, updateExistingOrCreate } from '~/pocketbase';
import { useStorage } from '@vueuse/core';

const generateProgressTimelines = () => {
  const timelines: Record<string, ReturnType<typeof createWeeklyTimeline<number>>> = {};
  for (const activity of config.activities) {
    timelines[activity.label] = createWeeklyTimeline(`activity-${activity.label}-timeline`, 0, sumReducer, 0);
  }
  return timelines;
};

const generateAllocationState = () => {
  const allocations: Record<string, Record<string, number>[]> = {};
  for (const activity of config.activities) {
    allocations[activity.label] = Array.from({ length: config.projectDuration + 1 }, () =>
      Object.keys(config.workers).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
    );
  }
  return allocations;
};

export const useActivitiesStore = defineStore('activities', () => {
  const gameStore = useGameStore();
  const workersStore = useWorkersStore();
  const equipmentStore = useEquipmentStore();
  const eventStore = useEventStore();

  // State
  const loading = ref(true);
  const progressTimelines = generateProgressTimelines();
  const allocations = useStorage('allocations', generateAllocationState());
  const weekActivityDone = useStorage<Record<string, number>>('weekActivityDone', {}); //Which week an activity is done. If an activity is not in the record, it is not done.

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
        hidden: isActivityHidden(activity, week),
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
      return activitiesAtWeek.value(week).every((act) => isActivityDone.value(act) || act.hidden);
    };
  });

  /**
   * Returns the duration of an activity. The duration is the time needed for an activity to be completed.
   */
  const getDuration = computed(() => {
    return (activity: ConfigActivity, week?: number) => {
      week ??= gameStore.week;
      const durationModification = getEventDurationModification.value(activity, week);
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
    return (type: string, week?: number) => {
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

      const eventWorkersModification: Partial<Record<string, number>> = getEventWorkersModification.value(
        activity,
        week,
      );

      if (!activity.requirements.workers && !eventWorkersModification) return true;

      const enoughWorkers = (type: string) => {
        if ((!activity.requirements.workers || !activity.requirements.workers[type]) && !eventWorkersModification[type])
          return true;
        const enoughAssigned =
          (activity.requirements.workers ? activity.requirements.workers[type] || 0 : 0) +
            eventWorkersModification[type]! <=
          activity.allocation[type];
        const enoughHired = totalWorkersAssigned.value(type, week) <= workersStore.workersAtWeek(week)[type];
        return enoughAssigned && enoughHired;
      };

      return Object.keys(config.workers).every(enoughWorkers);
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

  const totalProgress = computed(() => (week?: number) => {
    week ??= gameStore.week;
    const activities = activitiesAtWeek.value(week);
    return (
      activities
        .filter((act) => !act.hidden)
        .reduce((totalProgress, activity) => totalProgress + activity.progress / getDuration.value(activity, week), 0) /
      activities.length
    );
  });

  // Actions

  /**
   * Allocates a worker to a given activity in the current week.
   */
  function allocateWorker(activity: string, type: string, value: number) {
    allocations.value[activity][gameStore.week][type] = value;
  }
  /**
   * Progresses each activity which meets its requirements.
   * An activity cannot progress if it already done.
   */
  function progressActivities() {
    const equipmentStore = useEquipmentStore();

    for (const activity of activities.value) {
      // Calculate how much to progress the activity
      let activityProgress = 0;
      if (!isActivityDone.value(activity) && requirementsMet.value(activity, gameStore.week)) {
        if (isActivityResourceDependant(activity)) {
          const max = getDuration.value(activity) - activity.progress;
          activityProgress = Math.min(max, getResourceDependancyMultiplier(activity));
        } else {
          activityProgress = 1;
        }
      }
      // Progress the activity
      progressTimelines[activity.label].set(activityProgress, gameStore.week + 1);
      const activityDone = isActivityDone.value(activityFromLabel.value(activity.label, gameStore.week + 1));
      // Set delivery status
      if (activity.requirements.equipment) {
        activity.requirements.equipment.forEach((equipment) =>
          equipmentStore.setDeliveryStatus(
            equipment,
            activityDone ? 'delivered' : equipmentStore.equipment[equipment].status,
            undefined,
            gameStore.week + 1,
          ),
        );
      }
      if (activityDone && !weekActivityDone.value[activity.label]) {
        weekActivityDone.value = { ...weekActivityDone.value, [activity.label]: gameStore.week + 1 };
      } else if (!activityDone) {
        // @ts-expect-error - allow setting to undefined
        weekActivityDone.value = { ...weekActivityDone.value, [activity.label]: undefined };
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
    return (activity: ConfigActivity, week?: number, activityCompletion?: Record<string, number>) => {
      week ??= gameStore.week;
      activityCompletion ??= weekActivityDone.value;
      const durationModification = Object.entries(config.events)
        .filter(
          // Filter out events that are not active
          ([, event]) =>
            event.week <= week! &&
            (activityCompletion![activity.label] === undefined || activityCompletion![activity.label] > event.week),
        )
        .flatMap(
          // Get all effects from active events and choices
          ([name, event]) =>
            [
              ...(event.effects ?? []),
              ...(event.choices?.[eventStore.eventChoices[name]]?.effects ?? []),
            ] as EventEffect[],
        )
        .reduce(
          // Sum up the duration modification
          (acc, effect) =>
            acc +
            (effect.activityLabels && effect.durationModification && effect.activityLabels.includes(activity.label)
              ? effect.durationModification
              : 0),
          0,
        );
      return durationModification;
    };
  });

  /**
   * Returns the duration modification of an activity based on events.
   * The duration modification is the time added or subtracted from the duration of an activity.
   */
  const getEventWorkersModification = computed(() => {
    return (activity: ConfigActivity, week?: number, activityCompletion?: Record<string, number>) => {
      week ??= gameStore.week;
      activityCompletion ??= weekActivityDone.value;
      const workersModification: Record<string, number> = Object.keys(config.workers).reduce(
        (acc, key) => ({ ...acc, [key]: 0 }),
        {},
      );
      if (activityCompletion[activity.label] !== undefined && activityCompletion[activity.label] <= week) {
        return workersModification;
      }
      eventStore.activeEventEffectsAtWeek(week).forEach((effect) => {
        if (!effect.activityLabels?.includes(activity.label) || effect.workersModification === undefined) return;
        for (const key in config.workers) {
          workersModification[key] += effect.workersModification[key] || 0;
        }
      });
      return workersModification;
    };
  });

  function getResourceDependancyMultiplier(activity: Activity): number {
    let multiplier = Infinity;

    let workersRequired: Partial<Record<string, number>> = getEventWorkersModification.value(activity);
    workersRequired = Object.keys(config.workers).reduce(
      (acc, key) => ({ ...acc, [key]: (workersRequired[key] || 0) + (activity.requirements.workers?.[key] || 0) }),
      {},
    );

    Object.entries(workersRequired).forEach(([key, value]) => {
      if (value) {
        multiplier = Math.min(multiplier, activity.allocation[key] / value);
      }
    });

    return Math.floor(multiplier);
  }

  function isActivityResourceDependant(activity: Activity, week?: number): boolean {
    week ??= gameStore.week;

    return eventStore
      .activeEventEffectsAtWeek(week)
      .some((effect) => effect.activityLabels?.includes(activity.label) && effect.resourceDependant === true);
  }

  function isActivityHidden(activity: ConfigActivity, week?: number): boolean {
    week ??= gameStore.week;

    return (
      activity.hidden === true &&
      !eventStore
        .activeEventEffectsAtWeek(week)
        .some((effect) => effect.activityLabels?.includes(activity.label) && effect.revealActivity === true)
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

    // // Get existing allocation from database
    // try {
    //   const records = await collections.allocation.getFullList({
    //     filter: `user.username="${pocketbase.authStore.model!.username}"`,
    //   });
    //   for (let record of records) {
    //     allocations.value[record.activity][record.week][record.worker_type] = record.value || 0;
    //   }
    // } catch (error) {
    //   if (!(error instanceof ClientResponseError) || error.status !== 404) {
    //     throw error;
    //   }
    // }

    // // Get existing progress from database
    // try {
    //   const records = await collections.progress.getFullList({
    //     filter: `user.username="${pocketbase.authStore.model!.username}"`,
    //   });
    //   for (let record of records) {
    //     progressTimelines[record.activity].set(record.progress, record.week);
    //   }
    // } catch (error) {
    //   if (!(error instanceof ClientResponseError) || error.status !== 404) {
    //     throw error;
    //   }
    // }

    // // Get existing activity completion from database
    // try {
    //   const records = await collections.activityCompletion.getFullList({
    //     filter: `user.username="${pocketbase.authStore.model!.username}"`,
    //   });
    //   for (let record of records) {
    //     weekActivityDone.value[record.activity] = record.week;
    //   }
    // } catch (error) {
    //   if (!(error instanceof ClientResponseError) || error.status !== 404) {
    //     throw error;
    //   }
    // }

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

    activities.value.forEach((activity) => {
      // Update allocation
      Object.keys(config.workers).forEach((type) => {
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
            value: allocations.value[activity.label][gameStore.week][type],
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
      if (weekActivityDone.value[activity.label] !== undefined) {
        updateExistingOrCreate(
          collections.activityCompletion,
          `user.username="${pocketbase.authStore.model!.username}" && activity="${activity.label}"`,
          {
            user: pocketbase.authStore.model!.id,
            game_id: gameStore.gameID,
            activity: activity.label,
            week: weekActivityDone.value[activity.label],
          },
        );
      } else {
        deleteExisting(
          collections.activityCompletion,
          `user.username="${pocketbase.authStore.model!.username}" && activity="${activity.label}"`,
        );
      }
    });

    // Update total progress
    updateExistingOrCreate(
      collections.totalProgress,
      `user.username="${pocketbase.authStore.model!.username}" && week=${gameStore.week}`,
      {
        user: pocketbase.authStore.model!.id,
        game_id: gameStore.gameID,
        week: gameStore.week,
        progress: totalProgress.value(),
      },
    );
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
        if (gameStore.settingsLoaded) {
          synchronizedWatcher();
          connectWithDatabase();
          // Every time the week progresses, elligible activities are progressed.
          watch(
            () => gameStore.ready,
            () => {
              if (gameStore.ready) progressActivities();
            },
          );
        }
      },
    );
  }

  return {
    loading,
    weekActivityDone,
    activitiesAtWeek,
    activities,
    activityFromLabel,
    isActivityDone,
    allActivitiesDone,
    getDuration,
    totalWorkersAssigned,
    workerRequirementMet,
    requirementsMet,
    totalProgress,
    allocateWorker,
    progressActivities,
    connectWithDatabase,
    updateDatabase,
    getEventDurationModification,
    isActivityHidden,
  };
});
