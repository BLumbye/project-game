<template>
  <div class="container">
    <WeeklyReport v-if="weekStore.week > 0" />
    <h2 v-else>No weekly report in week {{ weekStore.week }}</h2>
    <DecisionForm />
  </div>
</template>

<script setup lang="ts">
import DecisionForm from './components/DecisionForm/DecisionForm.vue';
import WeeklyReport from './components/WeeklyReport/WeeklyReport.vue';
import { useWeekStore } from './stores/weekStore';

const weekStore = useWeekStore();
</script>

<style scoped lang="postcss">
.container {
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: start;
}
</style>