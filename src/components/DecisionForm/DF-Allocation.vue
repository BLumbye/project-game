<!-- 
  Allocation (Decision Form)

  Allocation is where the workers are assigned to an activity. 
  Only positive, whole numbers work.

-->

<template>
  <div class="allocation">
    <span class="activities-label">Activity</span>
    <VTooltip class="component-title">
      <span>Allocate workers to activities</span>
      <Info width="20"
            height="20"
            class="icon" />
      <template #popper>
        <p>Remember to allocate workers again in every week's 'Decision Form'.</p>
        <p>Remember to allocate a sufficient amount of workers for the task to progress.</p>
      </template>
    </VTooltip>
    <span :class="{ 'error-message': tooManyLab }"
          v-tooltip="{ content: 'Because you are trying to use more students than you have hired some activities will not progress.', disabled: !tooManyLab }">Student</span>
    <span :class="{ 'error-message': tooManySki }"
          v-tooltip="{ content: 'Because you are trying to use more technicians than you have hired some activities will not progress.', disabled: !tooManySki }">Technician</span>
    <template v-for="(activity, index) in activityStore.activities">
      <span>{{ activity.label }}</span>
      <input type="text"
             class="worker-input"
             :class="{ 'last-row': index === activityStore.activities.length - 1, 'input-error': tooManyLab && Number(lab[index]) > 0 }"
             v-tooltip="{ content: 'Because you are trying to use more labourers than you have hired this activity will not progress.', disabled: !tooManyLab || Number(lab[index]) === 0 }"
             name="LAB-input"
             v-model="lab[index]"
             :disabled="gameStore.ready"
             @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
             @input="(evt) => change(evt, activity.label, 'labour')" />
      <input type="text"
             class="worker-input"
             :class="{ 'last-row': index === activityStore.activities.length - 1, 'input-error': tooManySki && Number(ski[index]) > 0 }"
             v-tooltip="{ content: 'Because you are trying to use more skilled workers than you have hired this activity will not progress.', disabled: !tooManySki || Number(ski[index]) === 0 }"
             name="SKI-input"
             v-model="ski[index]"
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
import Info from '~/assets/info-small.svg';

const gameStore = useGameStore();
const workersStore = useWorkersStore();
const activityStore = useActivitiesStore();
const activities = config.activities;

const lab = ref<string[]>([]);
const ski = ref<string[]>([]);
const ele = ref<string[]>([]);

const tooManyLab = computed(() => workersStore.currentWorkers.labour < lab.value.reduce((acc, input) => acc + Number(input), 0));
const tooManySki = computed(() => workersStore.currentWorkers.skilled < ski.value.reduce((acc, input) => acc + Number(input), 0));
const tooManyEle = computed(() => workersStore.currentWorkers.electrician < ele.value.reduce((acc, input) => acc + Number(input), 0));

const change = (evt: Event, activityLabel: string, workerType: WorkerType) => {
  activityStore.allocateWorker(activityLabel, workerType, Number((evt.target as HTMLInputElement).value));
}

watch(() => gameStore.week, () => {
  for (let i = 0; i < activities.length; i++) {
    lab.value[i] = '';
    ski.value[i] = '';
    ele.value[i] = '';
  }
});

watch(
  () => activityStore.loading,
  () => {
    activityStore.activities.forEach((activity, i) => {
      lab.value[i] = activity.allocation.labour !== 0 ? activity.allocation.labour?.toString() : '';
      ski.value[i] = activity.allocation.skilled !== 0 ? activity.allocation.skilled?.toString() : '';
      ele.value[i] = activity.allocation.electrician !== 0 ? activity.allocation.electrician?.toString() : '';
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
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25em;
}

.allocation {
  display: grid;
  grid-template-columns: repeat(3, auto);
  grid-template-rows: repeat(v-bind('activities.length'), auto);
}

input {
  &+input {
    border-left-color: transparent;
  }

  &:not(.last-row) {
    border-bottom-color: transparent;
  }

  &:hover {
    border-color: #646cff;
  }
}
</style>