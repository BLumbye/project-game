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
      workersModification: {
        labour: wt.includes('labour') ? n : undefined,
        skilled: wt.includes('skilled') ? n : undefined,
        electrician: wt.includes('electrician') ? n : undefined,
      },
    });
  });
  return eventEffects;
}

export { addWorkers };
