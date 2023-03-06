<template>
  <div class="workers boxed">
    <span class="workers-title">Total workers on site:</span>
    <span class="workers-label">LAB</span>
    <span class="workers-label">SKI</span>
    <span class="workers-label">ELE</span>
    <span>{{ workers.labour }}</span>
    <span>{{ workers.skilled }}</span>
    <span>{{ workers.electrician }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWeekStore } from '../../stores/weekStore';
import { useWorkersStore } from '../../stores/workersStore';

const weekStore = useWeekStore();
const workersStore = useWorkersStore();
const workers = computed(() => workersStore.workersAtWeek(weekStore.week - 2));
</script>

<style scoped lang="postcss">
.workers {
  display: grid;
  grid-template-columns: repeat(4, auto);
}

.workers-title {
  grid-row: span 2;
  align-self: end;
}
</style>