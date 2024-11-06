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
      <Info width="24" height="24" class="icon" />
      <v-tooltip activator="parent" location="top"> Positive = hire, negative = fire. </v-tooltip>
    </div>
    <span class="workers-column-label">Worker</span>
    <span class="workers-column-label">Amount</span>
    <template v-for="(worker, key) in gameStore.config.workers" :key="key">
      <label :for="`${key}-input`" class="worker-label">{{ capitalize(worker.label) }}</label>
      <input
        :id="`${key}-input`"
        v-model="inputs[key]"
        v-tooltip:top="{ text: 'You cannot fire more workers than you have.', disabled: !inputError(key as string) }"
        type="text"
        :disabled="gameStore.ready"
        class="worker-input"
        :class="{ 'input-error': inputError(key as string) }"
        :name="`${key}-input`"
        @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber()))(evt as InputEvent)"
      />
    </template>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { and, isNumber, isWholeNumber, validate } from '~/utils/validation';
import Info from '~/assets/info-large.svg';
import { capitalize } from '~/utils/formatters';

const gameStore = useGameStore();
const workersStore = useWorkersStore();

const inputs = ref<Record<string, string>>(
  Object.keys(gameStore.config.workers).reduce((acc, worker) => ({ ...acc, [worker]: '' }), {}),
);
const inputError = computed(
  () => (worker: string) => workersStore.currentWorkers[worker] + Number(inputs.value[worker]) < 0,
);

watch(
  inputs,
  () => {
    Object.keys(inputs.value).forEach((key) => {
      workersStore.change(key, Number(inputs.value[key]) || 0);
    });
  },
  { deep: true },
);

watch(
  () => gameStore.week,
  () => {
    for (const key in inputs.value) {
      inputs.value[key] = '';
    }
  },
);

watch(
  () => workersStore.loading,
  () => {
    for (const key in inputs.value) {
      inputs.value[key] =
        workersStore.workers[gameStore.week][key] !== 0 ? workersStore.workers[gameStore.week][key].toString() : '';
    }
  },
  { immediate: true },
);
</script>

<!-- Styling -->

<style scoped lang="postcss">
.workers {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(v-bind('Object.keys(gameStore.config.workers).length + 2'), auto);
  gap: 4px 0.5rem;
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
