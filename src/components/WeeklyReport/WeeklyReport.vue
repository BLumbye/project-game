<!-- 
  Weekly Report

  The Weekly Report is a report generated based on the progress of the project so far.
  Is shows finances, activity progress and worker allocation.
  An in-depth summary of the previous week is shown as well as a general rundown of the whole project. 
-->

<template>
  <div class="weekly-report">
    <h2 class="boxed section-title">Daily report for day: {{ gameStore.week - 1 }}</h2>
    <WRAllocation v-if="gameStore.week > 1" />
    <WRWorkers v-if="gameStore.week > 1" />
    <WRFinances />
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
const gameStore = useGameStore();
</script>

<!-- Styling -->

<style scoped lang="postcss">
.weekly-report {
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-height: 100%;

  .section-title {
    width: 100%;
  }
}
</style>