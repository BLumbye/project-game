<!-- 
  Workers (Weekly Report)

  Shows the workers on-site in the last week. 
-->

<template>
  <div class="workers boxed">
    <span class="workers-title">Total workers on site:</span>
    <span v-for="(worker, key) in config.workers" :key="key" class="workers-label">{{ worker.shortLabel }}</span>
    <span v-for="(worker, key) in config.workers" :key="key">{{ workers[key] }}</span>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import config from '~/config';

const workersStore = useWorkersStore();
const workers = computed(() => workersStore.workersAtWeek(props.week - 2));

const props = defineProps<{
  week: number;
}>();
</script>

<!-- Styling -->

<style scoped lang="postcss">
.workers {
  display: grid;
  grid-template-columns: repeat(v-bind('Object.keys(config.workers).length + 1'), auto);
  column-gap: 1em;
}

.workers-title {
  grid-row: span 2;
  align-self: end;
}
</style>
