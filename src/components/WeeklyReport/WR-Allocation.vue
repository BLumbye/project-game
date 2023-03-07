<template>
  <div class="allocation boxed">
    <span class="activities-label">Activity</span>
    <span class="progress-label">Progress</span>
    <span class="component-title">Allocate workers to activities</span>
    <span>%</span>
    <span>LAB</span>
    <span>SKI</span>
    <span>ELE</span>
    <template v-for="(activity, index) in activities">
      <span>{{ activity.label }}</span>
      <span>{{ (progressActivities[index].progress /
        activityStore.getDuration(progressActivities[index]) *
        100).toFixed(0) }}%</span>
      <span>{{ activity.allocation.labour }}</span>
      <span>{{ activity.allocation.skilled }}</span>
      <span>{{ activity.allocation.electrician }}</span>
    </template>
    <span>Total</span>
    <span>{{ (progressActivities.reduce((completion, activity) => completion + (activity.progress /
      activityStore.getDuration(activity)), 0) / activities.length * 100).toFixed(0) }}%</span>
    <span>{{ activityStore.totalWorkersAssigned('labour', weekStore.week - 2) }}</span>
    <span>{{ activityStore.totalWorkersAssigned('skilled', weekStore.week - 2) }}</span>
    <span>{{ activityStore.totalWorkersAssigned('electrician', weekStore.week - 2) }}</span>
  </div>
</template>

<script setup lang="ts">
import { useActivitiesStore } from '../../stores/activitiesStore';
import config from '../../config';
import { useWeekStore } from '../../stores/weekStore';
import { computed } from 'vue';

const weekStore = useWeekStore();
const activityStore = useActivitiesStore();
const progressActivities = computed(() => activityStore.activitiesAtWeek(weekStore.week - 1));
const activities = computed(() => activityStore.activitiesAtWeek(weekStore.week - 2));
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
  column-gap: 1em;
}
</style>