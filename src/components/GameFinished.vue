<!-- 
  GameFinished

  The GameFinished is for when the game is over (either won or lost).
  It is shown next to the weekly report and informs the player of how well it went. 


-->

<template>
        <div class="contents">
            <h2>{{ gameStore.gameWon ? 'Project Completed' : 'Project not completed in time' }}</h2>
            <p class="text-won" v-if="gameStore.gameWon">You've successfully completed the project in {{ gameStore.week }} weeks with {{
                financeStore.balanceAtWeek(gameStore.week + 1)
                >= 0 ? `${formattedBalance} in profit.` : `${formattedBalance} over budget.` }}
            </p>
            <p v-if="gameStore.gameWon">
                    <img class="won-image" :src="'/images/CELEBRATING.png'"
                    :title="'Congratulations!'" />
            </p>
                
            <template v-else>
                <p>The project was not completed because you failed to {{ loseReasons }} in time.</p>
                <WRAllocation v-if="!activitiesStore.allActivitiesDone() && gameStore.week > 1"
                    :week="gameStore.week + 2" />
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
    style: 'long', type: 'conjunction'
});



const workersLeft = computed(() => Object.values(workersStore.currentWorkers).some((worker) => worker !== 0));

const loseReasons = computed(() => {
    const reasons = [];
    if (!activitiesStore.allActivitiesDone()) reasons.push('complete all activities');
    if (workersLeft.value) reasons.push('fire all workers');
    if (financeStore.loan !== 0) reasons.push('repay your loan');
    return listFormat.format(reasons);
})

const formattedBalance = computed(() => currencyFormat.format(Math.abs(financeStore.balanceAtWeek(gameStore.week + 1))));

watch(() => gameStore.gameOver, () => {
    if (gameStore.gameOver) {
        open();
    }
})

defineExpose({
    open,
});

</script>

<!-- Styling -->

<style scoped lang="postcss">

.contents {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 1em;
    max-height: 100%;

    .section-title {
        grid-column: span 2;
    }
}

.text-won{
    font-size: 20px;
    font-weight: bold;
}

.won-image {
    max-width: 40%;
    height: auto;
  }
</style>