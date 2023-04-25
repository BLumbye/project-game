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
import { ref, watch } from 'vue';
import config from '../../config';
import { useActivitiesStore } from '../../stores/activitiesStore';
import { useFinanceStore } from '../../stores/financeStore';
import { useWeekStore } from '../../stores/weekStore';
import { useWorkersStore } from '../../stores/workersStore';

const emit = defineEmits<{
  (e: 'week-progressed'): void
}>();

const gameDone = ref(false);
const gameOver = ref(false);

const weekStore = useWeekStore();
const workersStore = useWorkersStore();
const activitiesStore = useActivitiesStore();
const financeStore = useFinanceStore();

watch(() => weekStore.week, () => {
  // Check if game is done
  const noWorkers = Object.values(workersStore.currentWorkers).every(worker => worker === 0);
  const activitiesDone = activitiesStore.allActivitiesDone();
  const loanRepaid = financeStore.loan === 0;

  if (noWorkers &&
    activitiesDone &&
    loanRepaid
  ) {
    gameDone.value = true;
  }

  if (weekStore.week === config.duration) {
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
