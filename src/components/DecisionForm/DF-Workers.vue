<!-- 
  Workers (Decision Form)

  This is where the player(s) hires or fires workers.
  The input fields only accept whole numbers.
  Positive denotes hiring, negative firing. 
-->

<template>
  <div class="workers">
    <div class="component-title">
      <h3>Hire or fire workers</h3>
      <Info width="24"
            height="24"
            class="icon" />
      <v-tooltip activator="parent"
                 location="top">
        Positive = hire, negative = fire.
      </v-tooltip>
    </div>
    <span class="workers-column-label">Worker</span>
    <span class="workers-column-label">Amount</span>
    <label for="labour-input"
           class="worker-label">Labour</label>
    <input v-model="labour"
           type="text"
           :disabled="gameStore.ready"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber()))(evt as InputEvent)"
           class="worker-input"
           :class="{ 'input-error': labourError }"
           v-tooltip="{ content: 'You cannot fire more workers than you have.', disabled: !labourError }"
           id="labour-input"
           name="labour-input" />
    <label for="skilled-input"
           class="worker-label">Skilled</label>
    <input v-model="skilled"
           type="text"
           :disabled="gameStore.ready"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber()))(evt as InputEvent)"
           class="worker-input"
           :class="{ 'input-error': skilledError }"
           v-tooltip="{ content: 'You cannot fire more workers than you have.', disabled: !skilledError }"
           id="skilled-input"
           name="skilled-input" />
    <label for="electrician-input"
           class="worker-label">Electrician</label>
    <input v-model="electrician"
           type="text"
           :disabled="gameStore.ready"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber()))(evt as InputEvent)"
           class="worker-input"
           :class="{ 'input-error': electricianError }"
           v-tooltip="{ content: 'You cannot fire more workers than you have.', disabled: !electricianError }"
           id="electrician-input"
           name="electrician-input" />
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { WorkerType } from '../../types/types';
import { and, isNumber, isWholeNumber, validate } from '~/utils/validation';
import Info from '~/assets/info-large.svg';

const labour = ref('');       //Matches the v-model 'labour'
const skilled = ref('');
const electrician = ref('');

const labourError = computed(() => workersStore.currentWorkers.labour + Number(labour.value) < 0);
const skilledError = computed(() => workersStore.currentWorkers.skilled + Number(skilled.value) < 0);
const electricianError = computed(() => workersStore.currentWorkers.electrician + Number(electrician.value) < 0);

const gameStore = useGameStore();
const workersStore = useWorkersStore();

/**
 * Watches for input from the player.
 * If the player progresses a week and have inputted any whole number, workers are either hired (positive input) or fired (negative input). 
 * @param input The input in the field
 * @param type The type of worker
 */
const makeWorkerWatcher = (input: Ref<string>, type: WorkerType) => {
  watch(input, () => {
    workersStore.change(type, Number(input.value) || 0);
  });
}

makeWorkerWatcher(labour, 'labour');
makeWorkerWatcher(skilled, 'skilled');
makeWorkerWatcher(electrician, 'electrician');

watch(
  () => gameStore.week,
  () => {
    labour.value = '';
    skilled.value = '';
    electrician.value = '';
  },
);

watch(
  () => workersStore.loading,
  () => {
    labour.value = workersStore.workers[gameStore.week].labour !== 0 ? workersStore.workers[gameStore.week].labour.toString() : '';
    skilled.value = workersStore.workers[gameStore.week].skilled !== 0 ? workersStore.workers[gameStore.week].skilled.toString() : '';
    electrician.value = workersStore.workers[gameStore.week].electrician !== 0 ? workersStore.workers[gameStore.week].electrician.toString() : '';
  }, { immediate: true }
);
</script>

<!-- Styling -->

<style scoped lang="postcss">
.workers {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(5, auto);
  row-gap: 4px;
  column-gap: 0.5rem;
}

.component-title {
  grid-column: span 2;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5rem;
}

.worker-label {
  text-align: left;
}
</style>
