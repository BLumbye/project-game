<template>
  <div class="help boxed" v-if="messages.length > 0">
    <h3 class="help-title">Issues</h3>
    <p v-for="message in messages" :key="message" class="help-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore();
const activityStore = useActivitiesStore();
const workersStore = useWorkersStore();
const financeStore = useFinanceStore();

const props = defineProps<{
  week: number;
}>();

const disjunctionFormatter = new Intl.ListFormat('en', {
  style: 'long',
  type: 'disjunction',
});

const messages = computed(() => {
  const messages: string[] = [];
  const activities = activityStore.activitiesAtWeek(props.week - 2);

  // Add messages for each activity
  activities.forEach((activity) => {
    if (Object.values(activity.allocation).every((value) => value === 0)) return;

    // Dependency missing
    if (
      activity.requirements.activities?.some(
        (requiredActivity) => !activityStore.isActivityDone(activities.find((act) => act.label === requiredActivity)!),
      )
    ) {
      messages.push(
        `Activity ${activity.label} was unable to progress since ${activity.requirements.activities.length > 1 ? 'either' : ''} activity ${disjunctionFormatter.format(activity.requirements.activities)} was not done.`,
      );
    }

    // Workers missing
    if (activity.requirements.workers !== undefined) {
      Object.entries(activity.requirements.workers).forEach(([workerType, requiredWorkers]) => {
        if (requiredWorkers === undefined) return;
        if (requiredWorkers > activity.allocation[workerType]) {
          const label =
            requiredWorkers === 1
              ? gameStore.config.workers[workerType].label
              : gameStore.config.workers[workerType].plural;
          messages.push(
            `Activity ${activity.label} was unable to progress since it needs ${requiredWorkers} ${label} to be allocated.`,
          );
        }
      });
    }
  });

  // Add message if not enough workers are hired
  Object.entries(gameStore.config.workers).forEach(([workerType, worker]) => {
    if (
      activityStore.totalWorkersAssigned(workerType, props.week - 2) >
      workersStore.workersAtWeek(props.week - 2)[workerType]
    ) {
      messages.push(`No activities could progress since more ${worker.plural} were assigned than hired.`);
    }
  });

  // Add message if progress is done, but a loan is still outstanding
  if (activityStore.allActivitiesDone(props.week) && financeStore.hasActiveLoan(props.week)) {
    messages.push('To finish the game you need to repay your loan.');
  }

  // Add message if progress is done, but workers are still hired
  if (
    activityStore.allActivitiesDone(props.week) &&
    Object.values(useWorkersStore().currentWorkers).some((worker) => worker !== 0)
  ) {
    messages.push('To finish the game you need to fire all your workers.');
  }

  return messages;
});
</script>

<style scoped lang="postcss">
.help {
  text-align: left;
  max-width: 300px;

  .help-title {
    font-weight: bold;
    margin-bottom: 0.75rem;
  }
}

.help-message + .help-message {
  margin-top: 0.5rem;
}
</style>
