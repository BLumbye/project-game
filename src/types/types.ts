export type WorkerType = 'labour' | 'skilled' | 'electrician';
export type EquipmentType = 'steelwork' | 'interior' | 'tbs';
export type EquipmentStatus = 'unordered' | 'ordered' | 'delivered';
export type DeliveryType = 'regular' | 'express';
export interface Activity {
  label: string,
  duration: () => number,
  progress: number,
  requirements: Partial<{
    workers: Partial<Record<WorkerType, number>>,
    activities: string[],
    equipment: EquipmentType[],
  }>,
  allocation: Record<WorkerType, number>,
}