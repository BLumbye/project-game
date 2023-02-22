<template>
  <div class="allocation">
    <span class="activities-label">Activity</span>
    <span class="component-title">Allocate workers to activities</span>
    <span>LAB</span>
    <span>SKI</span>
    <span>ELE</span>
    <template v-for="activity in activities">                     <!-- For each -->
      <span>{{ activity.label }}</span>
      <input type="number" />
      <input type="number" />
      <input type="number" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useActivitiesStore } from '../stores/activitiesStore';

const activityStore = useActivitiesStore();
const activities = activityStore.activities;
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
  grid-template-columns: repeat(4, auto);
  grid-template-rows: repeat(v-bind('activities.length'), auto);   /* v-bind takes setup language */
}
</style>