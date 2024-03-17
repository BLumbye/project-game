<!-- 
  Allocation (Weekly Report)

  The Allocation in the Weekly Report shows the previous weeks' cumulative influence on the project's progress.

-->

<template>
  <div class="allocation boxed">
    <span class="activities-label">Activity</span>
    <span class="progress-label">Progress</span>
    <span class="component-title">Allocation</span>
    <span>%</span>
    <span v-for="(worker, key) in config.workers" :key="key">{{ worker.shortLabel }}</span>
    <template v-for="(activity, index) in activities">
      <template v-if="!activityStore.isActivityHidden(activity)">
        <span :class="{ 'activityFinished': activityStore.weekActivityDone[activity.label] == week - 1 }">{{
      activity.label
    }}</span>
        <span :class="{ 'activityFinished': activityStore.weekActivityDone[activity.label] == week - 1 }">{{
      (progressActivities[index].progress /
        activityStore.getDuration(progressActivities[index]) *
        100).toFixed(0) }}%</span>
        <span :class="{ 'activityFinished': activityStore.weekActivityDone[activity.label] == week - 1 }"
          v-for="(worker, key) in config.workers" :key="key">{{ activity.allocation[key]
          }}</span>
      </template>
    </template>
    <span>Total</span>
    <span>{{ (activityStore.totalProgress(week - 1) * 100).toFixed(0) }}%</span>
    <span v-for="(worker, key) in config.workers" :key="key">{{ activityStore.totalWorkersAssigned(key as string, week -
      2)
      }}</span>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import config from '~/config';

const activityStore = useActivitiesStore();
const progressActivities = computed(() => activityStore.activitiesAtWeek(props.week - 1));
const activities = computed(() => activityStore.activitiesAtWeek(props.week - 2));

const props = defineProps<{
  week: number;
}>();
</script>

<!-- Styling -->

<style scoped lang="postcss">
.activities-label {
  grid-row: span 2;
}

.component-title {
  grid-column: span v-bind('Object.keys(config.workers).length');
}

.allocation {
  display: grid;
  grid-template-columns: repeat(v-bind('Object.keys(config.workers).length + 2'), auto);
  grid-template-rows: repeat(v-bind('activities.length'), auto);
  column-gap: 1em;
}

.activityFinished {
  color: green;
}
</style>