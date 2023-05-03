import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import config from '../config';
import { Activity, WorkerType } from '../types/types';
import { useWeekStore } from './weekStore';
import { useEquipmentStore } from './equipmentStore';
import { useWorkersStore } from './workersStore';

const generateProgressTimelines = () => {
  const timelines: Record<string, number[]> = {};
  for (const activity of config.activities) {
    timelines[activity.label] = [];
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
  const weekStore = useWeekStore();
  const workersStore = useWorkersStore();
  const equipmentStore = useEquipmentStore();

  // State
  const progressTimelines = ref<Record<string, number[]>>(generateProgressTimelines());
  const allocations = ref<Record<string, Record<WorkerType, number>[]>>(generateAllocationState());

  // Getters

  /**
   * Returns the progress of an activity for a given week.
   * If no week is given, it returns for the current week.
   */
  const progressAtWeek = computed(() => {
    return (activity: string, week?: number) => {
      week ??= weekStore.week;
      return progressTimelines.value[activity]
        .slice(0, week + 1)
        .reduce((accumulator, current) => accumulator + current, 0);
    };
  });
  /**
   * Returns an array of all activites for a given week.
   * If no week is given, it returns for the current week.
   */
  const activitiesAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week;
      return config.activities.map((activity) => ({
        ...activity,
        progress: progressAtWeek.value(activity.label, week),
        allocation: allocations.value[activity.label][week!],
      })) as Activity[];
    };
  });
  const activities = computed(() => activitiesAtWeek.value(weekStore.week));

  /**
   * Returns true if an activity has finished in a given week.
   * If no week is given, it returns for the current week.
   */
  const isActivityDone = computed(() => {
    return (label: string, week?: number) => {
      week ??= weekStore.week;
      const activity = config.activities.find((activity) => activity.label === label);
      return activity !== undefined && getDuration.value(activity) <= progressAtWeek.value(label, week);
    };
  });

  /**
   * Returns true if all activites are done in the given week.
   * If no week is given, it returns for the current week.
   */
  const allActivitiesDone = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week;
      return config.activities.every((activity) => isActivityDone.value(activity.label, week));
    };
  });

  /**
   * Returns the duration of an activity. The duration is the time needed for an acitivty is done.
   */
  const getDuration = computed(() => {
    return (activity: Pick<Activity, 'duration'>) => {
      return activity.duration({ equipment: equipmentStore.equipmentAtWeek(weekStore.week - 1) });
    };
  });

  /**
   * Returns the total amount of workers assigned to an activity for a given week.
   * If no week is given, it returns for the current week.
   */
  const totalWorkersAssigned = computed(() => {
    return (type: WorkerType, week?: number) => {
      week ??= weekStore.week;
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
      week ??= weekStore.week;
      return (
        !activity.requirements.activities ||
        activity.requirements.activities.every((requiredActivity) => isActivityDone.value(requiredActivity, week))
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
      week ??= weekStore.week;
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
      week ??= weekStore.week;

      if (!activity.requirements.workers) return true;

      const enoughWorkers = (type: WorkerType) => {
        if (!activity.requirements.workers![type]) return true;
        const enoughAssigned = activity.requirements.workers![type]! <= activity.allocation[type];
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
    return (label: string, week?: number) => {
      week ??= weekStore.week;
      const activities = activitiesAtWeek.value(week);
      const activity = activities.find((activity) => activity.label === label);
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
    allocations.value[activity][weekStore.week][type] = value;
  }
  /**
   * Progresses each activity which meets its requirements.
   * An activity cannot progress if it already done.
   */
  function progressActivities() {
    for (const activity of config.activities) {
      if (!isActivityDone.value(activity.label) && requirementsMet.value(activity.label, weekStore.week - 1)) {
        progressTimelines.value[activity.label][weekStore.week] = 1;
        if (activity.requirements.equipment && isActivityDone.value(activity.label)) {
          const equipmentStore = useEquipmentStore();
          activity.requirements.equipment.forEach((equipment) => equipmentStore.finishDelivery(equipment));
        }
      }
    }
  }

  // Watch week store to progress activities

  /**
   * Every time the week progresses, elligible activities are progressed.
   */
  watch(
    () => weekStore.week,
    () => {
      progressActivities();
    },
  );

  return {
    progressAtWeek,
    activitiesAtWeek,
    activities,
    isActivityDone,
    allActivitiesDone,
    getDuration,
    totalWorkersAssigned,
    workerRequirementMet,
    requirementsMet,
    allocateWorker,
    progressActivities,
  };
});
