<template>
  <div class="allocation">
    <span class="activities-label">Activity</span>
    <span class="component-title">Allocate workers to activities</span>
    <span class="progress-label">Progress</span>
    <span>LAB</span>
    <span>SKI</span>
    <span>ELE</span>
    <template v-for="(activity, index) in activities"> <!-- For each -->
      <span>{{ activity.label }}</span>
      <input type="text"
             class="worker-input"
             name="LAB-input"
             ref="lab"
             @keypress="validateField"
             @input="(evt) => change(evt, activity.label, 'labour')" />
      <input type="text"
             class="worker-input"
             name="SKI-input"
             ref="ski"
             @keypress="validateField"
             @input="(evt) => change(evt, activity.label, 'skilled')" />
      <input type="text"
             class="worker-input"
             name="ELE-input"
             ref="ele"
             @keypress="validateField"
             @input="(evt) => change(evt, activity.label, 'electrician')" />
      <span>{{ activityStore.activities[index].progress }}/{{ activityStore.getDuration(activityStore.activities[index])
      }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useActivitiesStore } from '../stores/activitiesStore';
import { onMounted, Ref, ref, watch } from 'vue';
import { WorkerType } from '../types/types';
import config from '../config';
import { useWeekStore } from '../stores/weekStore';

const weekStore = useWeekStore();
const activityStore = useActivitiesStore();
const activities = config.activities;

const lab = ref<HTMLInputElement[]>([]);
const ski = ref<HTMLInputElement[]>([]);
const ele = ref<HTMLInputElement[]>([]);

const change = (evt: Event, activityLabel: string, workerType: WorkerType) => {
  activityStore.allocateWorker(activityLabel, workerType, Number((evt.target as HTMLInputElement).value));
}

const validateField = (evt: KeyboardEvent) => {
  if (!(/\d/.test(evt.key))) {
    evt.preventDefault();
  }
}

watch(() => weekStore.week, () => {
  lab.value.forEach(input => input.value = '');
  ski.value.forEach(input => input.value = '');
  ele.value.forEach(input => input.value = '');
})
</script>

<style scoped lang="postcss">
.activities-label,
.progress-label {
  grid-row: span 2;
}

.component-title {
  grid-column: span 3;
}

.allocation {
  display: grid;
  grid-template-columns: repeat(5, auto);
  grid-template-rows: repeat(v-bind('activities.length'), auto);

  /* v-bind takes setup language */
}
</style>