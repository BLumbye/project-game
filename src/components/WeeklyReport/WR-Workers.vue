<!-- 
  Workers (Weekly Report)

  Shows the workers on-site in the last week. 
-->

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

<!-- Script -->

<script setup lang="ts">
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
  grid-template-columns: repeat(4, auto);
}

.workers-title {
  grid-row: span 2;
  align-self: end;
}
</style>