/**
 * Types
 *
 * This is where relevant general types and interfaces are defined.
 */

export type WorkerType = 'labour' | 'skilled' | 'electrician';
export type EquipmentType = 'steelwork' | 'interior' | 'tbs';
export type EquipmentStatus = 'unordered' | 'ordered' | 'delivered';
export type DeliveryType = 'regular' | 'express';
export type bidType = 'bidPrice' | 'bidDuration' | 'expectedPrice' | 'expectedDuration';

export interface DurationParameters {
  equipment: Record<EquipmentType, Equipment>;
}

export interface Activity {
  label: string;
  duration: (parameters: DurationParameters) => number;
  progress: number;
  requirements: Partial<{
    workers: Partial<Record<WorkerType, number>>;
    activities: string[];
    equipment: EquipmentType[];
  }>;
  allocation: Record<WorkerType, number>;
}

export interface Equipment {
  status: EquipmentStatus;
  deliveryType?: DeliveryType;
}
