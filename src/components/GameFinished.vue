<!-- 
  GameFinished

  The GameFinished is for when the game is over (either won or lost).
  It is shown next to the weekly report and informs the player of how well it went. 


-->

<template>
  <div class="contents boxed">
    <h2>{{ gameStore.gameWon ? 'Project Completed' : 'Project not completed in time' }}</h2>
    <p v-if="gameStore.gameWon" class="text-won">
      You've successfully completed the project in {{ gameStore.week }}
      {{ gameStore.config.durationIdentifier.plural }} with
      {{
        financeStore.balanceAtWeek(gameStore.week + 1) >= 0
          ? `${formattedBalance} in profit.`
          : `${formattedBalance} over budget.`
      }}
    </p>
    <img v-if="gameStore.gameWon" class="won-image" :src="'/images/CELEBRATING.png'" :title="'Congratulations!'" />

    <template v-else>
      <p>The project was not completed because you failed to {{ loseReasons }} in time.</p>
      <WRAllocation v-if="!activitiesStore.allActivitiesDone() && gameStore.week > 1" :week="gameStore.week + 2" />
      <WRWorkers v-if="workersLeft && gameStore.week > 1" :week="gameStore.week + 2" />
      <WRFinances v-if="financeStore.loan !== 0 && gameStore.week > 1" :week="gameStore.week + 2" />
    </template>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { currencyFormat } from '~/utils/formatters';

const gameStore = useGameStore();
const financeStore = useFinanceStore();
const activitiesStore = useActivitiesStore();
const workersStore = useWorkersStore();

const listFormat = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
});

const workersLeft = computed(() => Object.values(workersStore.currentWorkers).some((worker) => worker !== 0));

const loseReasons = computed(() => {
  const reasons = [];
  if (!activitiesStore.allActivitiesDone()) reasons.push('complete all activities');
  if (workersLeft.value) reasons.push('fire all workers');
  if (financeStore.loan !== 0) reasons.push('repay your loan');
  return listFormat.format(reasons);
});

const formattedBalance = computed(() =>
  currencyFormat(gameStore.config).format(Math.abs(financeStore.balanceAtWeek(gameStore.week + 1))),
);

watch(
  () => gameStore.gameOver,
  () => {
    if (gameStore.gameOver) {
      open();
    }
  },
);

defineExpose({
  open,
});
</script>

<!-- Styling -->

<style scoped lang="postcss">
.contents {
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-height: 100%;
  align-items: center;
  max-width: 40%;
}

.text-won {
  font-size: 20px;
  font-weight: bold;
}

.won-image {
  max-width: 100%;
  border-radius: 0.5em;
}
</style>
