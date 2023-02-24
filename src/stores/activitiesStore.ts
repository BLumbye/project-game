import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import config from '../config';
import { Activity, WorkerType } from '../types/types';
import { useWeekStore } from './weekStore';
import { useEquipmentStore } from './equipmentStore';

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

  // State
  const progressTimelines = ref<Record<string, number[]>>(generateProgressTimelines());
  const allocations = ref<Record<string, Record<WorkerType, number>[]>>(generateAllocationState());

  // Getters
  const progressAtWeek = computed(() => {
    return (activity: string, week?: number) => {
      week ??= weekStore.week;
      return progressTimelines.value[activity]
        .slice(0, week)
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
  const activities = computed(() => activitiesAtWeek.value());
  const isActivityDone = computed(() => {
    return (label: string, week?: number) => {
      week ??= weekStore.week;
      const activity = config.activities.find((activity) => activity.label === label);
      return activity !== undefined && activity?.duration() <= progressAtWeek.value(label, week);
    };
  });
  const allActivitiesDone = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week;
      return config.activities.every((activity) => isActivityDone.value(activity.label, week));
    };
  });
  const requirementsMet = computed(() => {
    return (label: string, week?: number) => {
      week ??= weekStore.week;
      const activities = activitiesAtWeek.value(week);
      const activity = activities.find((activity) => activity.label === label);
      if (!activity) return false;
      if (
        activity.requirements.activities &&
        activity.requirements.activities.some((requiredActivity) => !isActivityDone.value(requiredActivity, week))
      )
        return false;
      if (activity.requirements.equipment) {
        const equipmentStore = useEquipmentStore();
        if (
          activity.requirements.equipment.some(
            (requiredEquipment) => equipmentStore.equipmentAtWeek(week)[requiredEquipment]?.status !== 'unordered',
          )
        )
          return false;
      }
      if (
        activity.requirements.workers &&
        !(
          activity.requirements.workers.labour &&
          activity.requirements.workers.labour > allocations.value[activity.label][week].labour
        ) &&
        !(
          activity.requirements.workers.skilled &&
          activity.requirements.workers.skilled > allocations.value[activity.label][week].skilled
        ) &&
        !(
          activity.requirements.workers.electrician &&
          activity.requirements.workers.electrician > allocations.value[activity.label][week].electrician
        )
      )
        return false;
      return true;
    };
  });

  // Actions
  function allocateWorker(activity: string, type: WorkerType, value: number) {
    allocations.value[activity][weekStore.week][type] = value;
  }
  function progressActivities() {
    for (const activity of config.activities) {
      if (!isActivityDone.value(activity.label) && requirementsMet.value(activity.label)) {
        progressTimelines.value[activity.label][weekStore.week] = 1;
        if (activity.requirements.equipment && isActivityDone.value(activity.label)) {
          const equipmentStore = useEquipmentStore();
          activity.requirements.equipment.forEach((equipment) => equipmentStore.finishDelivery(equipment));
        }
      }
    }
  }

  return {
    progressTimelines,
    allocations,
    progressAtWeek,
    activitiesAtWeek,
    activities,
    isActivityDone,
    allActivitiesDone,
    requirementsMet,
    allocateWorker,
    progressActivities,
  };
});
