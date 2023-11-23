<!-- 
  Weekly Report

  The Weekly Report is a report generated based on the progress of the project so far.
  Is shows finances, activity progress and worker allocation.
  An in-depth summary of the previous week is shown as well as a general rundown of the whole project. 
-->

<template>
  <div class="weekly-report">
    <h2 class="boxed section-title">{{capitalize(config.durationIdentifier.iterative)}} report for {{config.durationIdentifier.singular}} {{ week - 1 }}</h2>
    <div class="week-buttons">
      <button @click="week--"
              :disabled="week <= 2">&lt;- Back</button>
      <button @click="week++"
              :disabled="(week >= gameStore.week && !gameStore.gameOver) || week >= config.projectDuration+1">Forward -></button>
    </div>
    <WRAllocation v-if="week > 1"
                  :week="week" />
    <WRWorkers v-if="week > 1"
               :week="week" />
    <WRFinances :week="week" />
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
const gameStore = useGameStore();
const week = ref(gameStore.week);
import config from '~/config';
import {capitalize} from '~/utils/formatters';

watch(() => gameStore.week, () => {
  week.value = gameStore.week;
})
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

.week-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1em;

  & button {
    flex-grow: 1;
  }
}
</style>