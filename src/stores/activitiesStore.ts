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
    allocations[activity.label] = Array.from({ length: config.duration }, () => ({
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
  const progressAtWeek = computed(() => {
    return (activity: string, week?: number) => {
      week ??= weekStore.week;
      return progressTimelines.value[activity]
        .slice(0, week + 1)
        .reduce((accumulator, current) => accumulator + current, 0);
    };
  });
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
  const isActivityDone = computed(() => {
    return (label: string, week?: number) => {
      week ??= weekStore.week;
      const activity = config.activities.find((activity) => activity.label === label);
      return activity !== undefined && getDuration.value(activity) <= progressAtWeek.value(label, week);
    };
  });
  const allActivitiesDone = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week;
      return config.activities.every((activity) => isActivityDone.value(activity.label, week));
    };
  });
  const getDuration = computed(() => {
    return (activity: Pick<Activity, 'duration'>) => {
      return activity.duration({ equipment: equipmentStore.equipmentAtWeek(weekStore.week - 1) });
    };
  });
  const totalWorkersAssigned = computed(() => {
    return (type: WorkerType, week?: number) => {
      week ??= weekStore.week;
      return config.activities.reduce(
        (totalWorkers, activity) => totalWorkers + allocations.value[activity.label][week!][type],
        0,
      );
    };
  });
  const activityRequirementMet = computed(() => {
    return (activity: Activity, week?: number) => {
      week ??= weekStore.week;
      return (
        !activity.requirements.activities ||
        activity.requirements.activities.every((requiredActivity) => isActivityDone.value(requiredActivity, week))
      );
    };
  });
  const equipmentRequirementMet = computed(() => {
    return (activity: Activity, week?: number) => {
      week ??= weekStore.week;
      if (!activity.requirements.equipment) return true;
      return activity.requirements.equipment.every(
        (requiredEquipment) => equipmentStore.equipmentAtWeek(week)[requiredEquipment]?.status !== 'unordered',
      );
    };
  });
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
  function allocateWorker(activity: string, type: WorkerType, value: number) {
    allocations.value[activity][weekStore.week][type] = value;
  }
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
  watch(
    () => weekStore.week,
    () => {
      progressActivities();
    },
  );

  return {
    progressTimelines,
    allocations,
    progressAtWeek,
    activitiesAtWeek,
    activities,
    isActivityDone,
    allActivitiesDone,
    getDuration,
    workerRequirementMet,
    requirementsMet,
    allocateWorker,
    progressActivities,
  };
});
