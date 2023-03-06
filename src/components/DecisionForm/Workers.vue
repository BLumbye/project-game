<template>
  <div class="workers">
    <h3 class="component-title">Hire or fire workers</h3>
    <!-- header, css, fysisk title -->
    <span class="workers-column-label">Worker</span>
    <span class="workers-column-label">Amount</span>
    <label for="labour-input"
           class="worker-label">Labour</label>
    <input v-model="labour"
           type="text"
           class="worker-input"
           name="labour-input" />
    <label for="skilled-input"
           class="worker-label">Skilled</label>
    <input v-model="skilled"
           type="text"
           class="worker-input"
           name="skilled-input" />
    <label for="electrician-input"
           class="worker-label">Electrician</label>
    <input v-model="electrician"
           type="text"
           class="worker-input"
           name="electrician-input" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from 'vue';
import { useWeekStore } from '../../stores/weekStore';
import { useWorkersStore } from '../../stores/workersStore';
import { WorkerType } from '../../types/types';

const labour = ref('');       //Matches the v-model 'labour'
const skilled = ref('');
const electrician = ref('');

const weekStore = useWeekStore();
const workersStore = useWorkersStore();

const makeWorkerWatcher = (input: Ref<string>, type: WorkerType) => {
  watch(input, () => {
    workersStore.change(type, parseInt(input.value) || 0);
  });
}

makeWorkerWatcher(labour, 'labour');
makeWorkerWatcher(skilled, 'skilled');
makeWorkerWatcher(electrician, 'electrician');

watch(
  () => weekStore.week,
  () => {
    labour.value = '';
    skilled.value = '';
    electrician.value = '';
  },
);
</script>

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
