<template>
  <dialog ref="dialog" @click="backgroundClickClose">
    <div class="contents">
      <h2>{{ gameStore.gameWon ? 'Project Completed' : 'Project not completed in time' }}</h2>
      <p v-if="gameStore.gameWon">
        You've successfully completed the project in {{ gameStore.week }}
        {{ gameStore.config.durationIdentifier.plural }} with
        {{ financeStore.balanceAtWeek() >= 0 ? `${formattedBalance} in profit.` : `${formattedBalance} over budget.` }}
      </p>
      <template v-else>
        <p>The project was not completed because you failed to {{ loseReasons }} in time.</p>
        <WRAllocation v-if="!activitiesStore.allActivitiesDone() && gameStore.week > 1" :week="gameStore.week + 2" />
        <WRWorkers v-if="workersLeft && gameStore.week > 1" :week="gameStore.week + 2" />
        <WRFinances v-if="financeStore.loan !== 0 && gameStore.week > 1" :week="gameStore.week + 2" />
      </template>
      <button @click="() => dialog?.close()">Close</button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { backgroundClickClose } from '~/utils/dialog';
import { currencyFormat } from '~/utils/formatters';

const gameStore = useGameStore();
const financeStore = useFinanceStore();
const activitiesStore = useActivitiesStore();
const workersStore = useWorkersStore();

const dialog = ref<HTMLDialogElement | null>(null);

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

const open = () => {
  dialog.value?.showModal();
};

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

<style scoped lang="postcss">
dialog {
  width: clamp(200px, 50%, 500px);
}

.contents {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;
  text-align: center;
}
</style>
