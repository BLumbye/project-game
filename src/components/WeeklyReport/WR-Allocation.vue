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
    <span>Student</span>
    <span>Technician</span>
    <template v-for="(activity, index) in activities">
      <span>{{ activity.label }}</span>
      <span>{{ (progressActivities[index].progress /
        activityStore.getDuration(progressActivities[index]) *
        100).toFixed(0) }}%</span>
      <span>{{ activity.allocation.labour }}</span>
      <span>{{ activity.allocation.skilled }}</span>
    </template>
    <span>Total</span>
    <span>{{ (progressActivities.reduce((completion, activity) => completion + (activity.progress /
      activityStore.getDuration(activity)), 0) / activities.length * 100).toFixed(0) }}%</span>
    <span>{{ activityStore.totalWorkersAssigned('labour', week - 2) }}</span>
    <span>{{ activityStore.totalWorkersAssigned('skilled', week - 2) }}</span>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
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
  grid-column: span 2;
}

.allocation {
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-template-rows: repeat(v-bind('activities.length'), auto);
  column-gap: 1em;
}
</style>