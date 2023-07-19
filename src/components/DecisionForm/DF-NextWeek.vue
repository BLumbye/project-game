<!-- 
  Next Week (Decision Form)

  Next Week is a simple button which progresses the game one week when clicked.
-->

<template>
  <button class="next-week-button"
          @click="emit('week-progressed')"
          :disabled="gameDone || gameOver">{{ gameDone ? "Game Done" : gameOver ? "Game Over" : "Next Week ->" }}</button>
</template>

<!-- Script -->

<script setup lang="ts">
import config from '../../config';

const emit = defineEmits<{
  (e: 'week-progressed'): void
}>();

const gameDone = ref(false);
const gameOver = ref(false);

const gameStore = useGameStore();
const workersStore = useWorkersStore();
const activitiesStore = useActivitiesStore();
const financeStore = useFinanceStore();

/**
 * Checks whether the game is done (win) or over (lose) whenever a week progresses. The game is done if the following requirements are met:
 * 1) All workers are fired
 * 2) All activites are done
 * 3) Any potential loan has been repaid
 * 
 * You lose if more weeks have passed then allowed by the project duration defined in Config
 */
watch(() => gameStore.week, () => {

  const noWorkers = Object.values(workersStore.currentWorkers).every(worker => worker === 0);
  const activitiesDone = activitiesStore.allActivitiesDone();
  const loanRepaid = financeStore.loan === 0;

  if (noWorkers &&
    activitiesDone &&
    loanRepaid
  ) {
    gameDone.value = true;
  }

  if (gameStore.week === config.duration) {
    gameOver.value = true;
  }
});
</script>

<!-- Styling -->

<style scoped lang="postcss">
.next-week-button {
  text-align: center;
  font-size: 1rem;
}
</style>
