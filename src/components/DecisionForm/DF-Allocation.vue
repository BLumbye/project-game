<!-- 
  Allocation (Decision Form)

  Allocation is where the workers are assigned to an activity. 
  Only positive, whole numbers work.

-->

<template>
  <div class="allocation">
    <span class="activities-label">Activity</span>
    <div class="component-title">
      <span>Allocate workers to activities</span>
      <Info width="20" height="20" class="icon" />
      <v-tooltip activator="parent" location="top">
        <p>Remember to allocate workers again in every {{ config.durationIdentifier.singular }}'s 'Decision Form'.</p>
        <p>Remember to allocate a sufficient amount of workers for the task to progress.</p>
      </v-tooltip>
    </div>
    <span
      v-for="(worker, key) in config.workers"
      :key="key"
      v-tooltip="{
        content: `Because you are trying to use more ${worker.plural} than you have hired some activities will not progress.`,
        disabled: !tooManyWorkers(key as string),
      }"
      :class="{ 'error-message': tooManyWorkers(key as string) }"
      >{{ worker.shortLabel }}</span
    >
    <template v-for="(activity, index) in activityStore.activities" :key="activity.label">
      <template v-if="!activityStore.isActivityHidden(activity)">
        <span>{{ activity.label }}</span>
        <input
          v-for="(worker, key) in config.workers"
          :key="key"
          v-model="inputs[key][index]"
          v-tooltip="{
            content: `Because you are trying to use more ${worker.plural} than you have hired this activity will not progress.`,
            disabled: !tooManyWorkers(key as string) || Number(inputs[key][index]) === 0,
          }"
          type="text"
          class="worker-input"
          :class="{
            'last-row': index === activityStore.activities.filter((act) => !act.hidden).length - 1,
            'input-error': tooManyWorkers(key as string) && Number(inputs[key][index]) > 0,
          }"
          name="LAB-input"
          :disabled="gameStore.ready"
          @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
          @input="(evt) => change(evt, activity.label, key as string)"
        />
      </template>
    </template>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import config from '../../config';
import { and, asNumber, isNumber, isPositive, isWholeNumber, validate } from '~/utils/validation';
import Info from '~/assets/info-small.svg';

const gameStore = useGameStore();
const workersStore = useWorkersStore();
const activityStore = useActivitiesStore();
const activities = config.activities;

const inputs = ref<Record<string, string[]>>(
  Object.keys(config.workers).reduce((acc, worker) => ({ ...acc, [worker]: [] }), {}),
);

const tooManyWorkers = computed(
  () => (worker: string) =>
    workersStore.currentWorkers[worker] < inputs.value[worker].reduce((acc, input) => acc + Number(input), 0),
);

const change = (evt: Event, activityLabel: string, workerType: string) => {
  activityStore.allocateWorker(activityLabel, workerType, Number((evt.target as HTMLInputElement).value));
};

watch(
  () => gameStore.week,
  () => {
    for (const worker in inputs.value) {
      for (let i = 0; i < activities.length; i++) {
        inputs.value[worker][i] = '';
      }
    }
  },
);

watch(
  () => activityStore.loading,
  () => {
    activityStore.activities.forEach((activity, i) => {
      for (const worker in config.workers) {
        inputs.value[worker][i] = activity.allocation[worker] !== 0 ? activity.allocation[worker]?.toString() : '';
      }
    });
  },
  { immediate: true },
);
</script>

<!-- Styling -->

<style scoped lang="postcss">
.activities-label,
.progress-label {
  grid-row: span 2;
}

.component-title {
  grid-column: span v-bind('Object.keys(config.workers).length');
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25em;
}

.allocation {
  display: grid;
  grid-template-columns: repeat(v-bind('Object.keys(config.workers).length + 1'), auto);
  grid-template-rows: repeat(v-bind('activities.length'), auto);
}

input {
  & + input {
    border-left: transparent;
  }

  &:not(.last-row) {
    border-bottom-color: transparent;
  }

  &:hover {
    border-color: #646cff;
  }
}
</style>
