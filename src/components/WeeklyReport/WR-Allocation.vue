<!-- 
  Allocation (Weekly Report)

  The Allocation in the Weekly Report shows the previous weeks' cumulative influence on the project's progress.

-->

<template>
  <div class="allocation boxed">
    <span class="activities-label">Activity</span>
    <span class="progress-label">Progress</span>
    <span class="component-title">Allocation</span>
    <v-tooltip activator="parent" location="top">
      <p>
        Here you see how your workers were allocated to work last {{ gameStore.config.durationIdentifier.singular }}.
      </p>
      <p>
        <span class="activityFinished">Green</span> means the activity was finished at the end of that
        {{ gameStore.config.durationIdentifier.singular }}.
      </p>
      <p>
        <span class="dependancyMissing">Orange</span> means you did not meet the requirements for the activity to
        progress (incorrect dependencies).
      </p>
      <p><span class="incorrectWorkers">Red</span> means you allocated an incorrect amount of workers.</p>
    </v-tooltip>
    <span>%</span>
    <span v-for="(worker, key) in gameStore.config.workers" :key="key">{{ worker.shortLabel }}</span>
    <template v-for="(activity, index) in activities" :key="activity.label">
      <template v-if="!activity.hidden">
        <span :class="{ activityFinished: activityStore.weekActivityDone[activity.label] == week - 1 }">
          {{ activity.label }}
        </span>
        <span :class="{ activityFinished: activityStore.weekActivityDone[activity.label] == week - 1 }"
          >{{
            ((progressActivities[index].progress / activityStore.getDuration(progressActivities[index])) * 100).toFixed(
              0,
            )
          }}%</span
        >
        <span
          v-for="(worker, key) in gameStore.config.workers"
          :key="key"
          :class="{
            activityFinished: activityStore.weekActivityDone[activity.label] == week - 1,
            dependancyMissing:
              (!activityStore.equipmentRequirementMet(activity, week - 1) ||
                !activityStore.activityRequirementMet(activity, week - 1)) &&
              activity.allocation[key] > 0,
            incorrectWorkers: !activityStore.workerRequirementMet(activity, week - 1) && activity.allocation[key] > 0,
          }"
          >{{ activity.allocation[key] }}</span
        >
      </template>
    </template>
    <span>Total</span>
    <span>{{ (activityStore.totalProgress(week - 1) * 100).toFixed(0) }}%</span>
    <span
      v-for="(worker, key) in gameStore.config.workers"
      :key="key"
      :class="{
        incorrectWorkers:
          activityStore.totalWorkersAssigned(key as string, week - 2) > workersStore.workersAtWeek(week - 1)[key],
      }"
    >
      {{ activityStore.totalWorkersAssigned(key as string, week - 2) }}</span
    >
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
const gameStore = useGameStore();
const activityStore = useActivitiesStore();
const workersStore = useWorkersStore();
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
  grid-column: span v-bind('Object.keys(gameStore.config.workers).length');
}

.allocation {
  display: grid;
  grid-template-columns: repeat(v-bind('Object.keys(gameStore.config.workers).length + 2'), auto);
  grid-template-rows: repeat(v-bind('activities.length'), auto);
  column-gap: 1em;
}

.incorrectWorkers {
  color: var(--color-error);
}

.activityFinished {
  color: green;
}

.dependancyMissing {
  color: var(--color-warning);
}
</style>
