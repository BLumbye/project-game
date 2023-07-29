<!-- 
  Allocation (Decision Form)

  Allocation is where the workers are assigned to an activity. 
  Only positive, whole numbers work.

-->

<template>
  <div class="allocation">
    <span class="activities-label">Activity</span>
    <span class="component-title">Allocate workers to activities</span>
    <span>Student</span>
    <span>Technician</span>
    <template v-for="activity in activityStore.activities">
      <span>{{ activity.label }}</span>
      <input type="text"
             class="worker-input"
             name="LAB-input"
             ref="lab"
             :disabled="gameStore.ready"
             @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
             @input="(evt) => change(evt, activity.label, 'labour')" />
      <input type="text"
             class="worker-input"
             name="SKI-input"
             ref="ski"
             :disabled="gameStore.ready"
             @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
             @input="(evt) => change(evt, activity.label, 'skilled')" />
    </template>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { WorkerType } from '../../types/types';
import config from '../../config';
import { and, asNumber, isNumber, isPositive, isWholeNumber, validate } from '~/utils/validation';

const gameStore = useGameStore();
const activityStore = useActivitiesStore();
const activities = config.activities;

const lab = ref<HTMLInputElement[]>([]);
const ski = ref<HTMLInputElement[]>([]);
const ele = ref<HTMLInputElement[]>([]);

const change = (evt: Event, activityLabel: string, workerType: WorkerType) => {
  activityStore.allocateWorker(activityLabel, workerType, Number((evt.target as HTMLInputElement).value));
}

watch(() => gameStore.week, () => {
  lab.value.forEach(input => input.value = '');
  ski.value.forEach(input => input.value = '');
  ele.value.forEach(input => input.value = '');
});

watch(
  () => activityStore.loading,
  () => {
    activityStore.activities.forEach((activity, i) => {
      lab.value[i].value = activity.allocation.labour !== 0 ? activity.allocation.labour?.toString() : '';
      ski.value[i].value = activity.allocation.skilled !== 0 ? activity.allocation.skilled?.toString() : '';
      ele.value[i].value = activity.allocation.electrician !== 0 ? activity.allocation.electrician?.toString() : '';
    });
  },
);
</script>

<!-- Styling -->

<style scoped lang="postcss">
.activities-label,
.progress-label {
  grid-row: span 2;
}

.component-title {
  grid-column: span 2;
}

.allocation {
  display: grid;
  grid-template-columns: repeat(3, auto);
  grid-template-rows: repeat(v-bind('activities.length'), auto);

  /* v-bind takes setup language */
}
</style>