<template>
  <div class="allocation boxed">
    <span class="activities-label">Activity</span>
    <span class="progress-label">Progress</span>
    <span class="component-title">Allocate workers to activities</span>
    <span>%</span>
    <span>LAB</span>
    <span>SKI</span>
    <span>ELE</span>
    <template v-for="(activity, index) in activityStore.activitiesAtWeek(weekStore.week - 2)">
      <span>{{ activity.label }}</span>
      <span>{{ (activityStore.activitiesAtWeek(weekStore.week - 1)[index].progress / activityStore.getDuration(activity) *
        100).toFixed(0) }}%</span>
      <span>{{ activity.allocation.labour }}</span>
      <span>{{ activity.allocation.skilled }}</span>
      <span>{{ activity.allocation.electrician }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useActivitiesStore } from '../../stores/activitiesStore';
import config from '../../config';
import { useWeekStore } from '../../stores/weekStore';

const weekStore = useWeekStore();
const activityStore = useActivitiesStore();
const activities = config.activities;
</script>

<style scoped lang="postcss">
.activities-label {
  grid-row: span 2;
}

.component-title {
  grid-column: span 3;
}

.allocation {
  display: grid;
  grid-template-columns: repeat(5, auto);
  grid-template-rows: repeat(v-bind('activities.length'), auto);
}
</style>