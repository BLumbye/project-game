<!-- 
  Workers (Decision Form)

  This is where the player(s) hires or fires workers.
  The input fields only accept whole numbers.
  Positive denotes hiring, negative firing. 
-->

<template>
  <div class="workers">
    <h3 class="component-title">Hire or fire workers</h3>
    <span class="workers-column-label">Worker</span>
    <span class="workers-column-label">Amount</span>
    <label for="labour-input"
           class="worker-label">Labour</label>
    <input v-model="labour"
           type="text"
           :disabled="gameStore.ready"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber()))(evt as InputEvent)"
           class="worker-input"
           name="labour-input" />
    <label for="skilled-input"
           class="worker-label">Skilled</label>
    <input v-model="skilled"
           type="text"
           :disabled="gameStore.ready"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber()))(evt as InputEvent)"
           class="worker-input"
           name="skilled-input" />
    <label for="electrician-input"
           class="worker-label">Electrician</label>
    <input v-model="electrician"
           type="text"
           :disabled="gameStore.ready"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber()))(evt as InputEvent)"
           class="worker-input"
           name="electrician-input" />
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { WorkerType } from '../../types/types';
import { and, isNumber, isWholeNumber, validate } from '~/utils/validation';


const labour = ref('');       //Matches the v-model 'labour'
const skilled = ref('');
const electrician = ref('');

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
    workersStore.change(type, parseInt(input.value) || 0);
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
  },
);
</script>

<!-- Styling -->

<style scoped lang="postcss">
.workers {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(5, auto);
}

.component-title {
  grid-column: span 2;
}

.worker-label {
  text-align: left;
}
</style>
