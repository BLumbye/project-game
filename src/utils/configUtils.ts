import { ConfigActivities, WorkerType, EventEffect } from '../types/types';

/**
 * Adds extra required workers to the given activities.
 * @param labels
 * @param wt
 * @param n
 * @param activities
 */
function addWorkers(labels: string[], wt: WorkerType[], n: number, activities: ConfigActivities): EventEffect[] {
  const eventEffects: EventEffect[] = [];
  labels.forEach((l) => {
    eventEffects.push({
      activityLabels: [l],
      newWorkers: {
        labour:
          wt.indexOf('labour') !== -1
            ? (activities.find((activity) => activity.label === l)!.requirements.workers!.labour || 0) + n
            : undefined,
        skilled:
          wt.indexOf('skilled') !== -1
            ? (activities.find((activity) => activity.label === l)!.requirements.workers!.skilled || 0) + n
            : undefined,
        electrician:
          wt.indexOf('electrician') !== -1
            ? (activities.find((activity) => activity.label === l)!.requirements.workers!.electrician || 0) + n
            : undefined,
      },
    });
  });
  return eventEffects;
}

export { addWorkers };
