<template>
  <div class="weekly-report">
    <h2 class="boxed section-title">Weekly report for week: {{ weekStore.week - 1 }}</h2>
    <WRAllocation />
    <WRWorkers />
    <WRFinances />
  </div>
</template>

<script setup lang="ts">
import { useWeekStore } from '../../stores/weekStore';
import WRAllocation from './WR-Allocation.vue';
import WRFinances from './WR-Finances.vue';
import WRWorkers from './WR-Workers.vue';

const weekStore = useWeekStore();
</script>

<style scoped lang="postcss">
.weekly-report {
  display: flex;
  flex-direction: column;

  .section-title {
    width: 100%;
  }
}
</style>