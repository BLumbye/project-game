import { EventEffect } from '../types/types';

/**
 * Adds extra required workers to the given activities.
 * @param labels
 * @param wt
 * @param n
 */
function addWorkers(labels: string[], wt: string[], n: number): EventEffect[] {
  const eventEffects: EventEffect[] = [];
  labels.forEach((l) => {
    eventEffects.push({
      activityLabels: [l],
      workersModification: wt.reduce((acc, key) => ({ ...acc, [key]: n }), {} as Record<string, number>),
    });
  });
  return eventEffects;
}

export { addWorkers };
