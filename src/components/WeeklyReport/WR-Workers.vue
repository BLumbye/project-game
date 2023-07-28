<!-- 
  Workers (Weekly Report)

  Shows the workers on-site in the last week. 
-->

<template>
  <div class="workers boxed">
    <span class="workers-title">Total workers on site:</span>
    <span class="workers-label">Students</span>
    <span class="workers-label">Technicians</span>
    <span>{{ workers.labour }}</span>
    <span>{{ workers.skilled }}</span>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
const gameStore = useGameStore();
const workersStore = useWorkersStore();
const workers = computed(() => workersStore.workersAtWeek(gameStore.week - 2));
</script>

<!-- Styling -->

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