<!-- 
  Next Week (Decision Form)

  Next Week is a simple button which progresses the game one week when clicked.
-->

<template>
  <button class="done-button" :disabled="gameStore.gameOver" @click="handleClick">
    {{ buttonText }}
  </button>
</template>

<!-- Script -->

<script setup lang="ts">
import config from '~/config';
const gameStore = useGameStore();

const buttonText = computed(() => {
  if (gameStore.gameOver) {
    return gameStore.gameWon ? 'Project Completed' : 'Project not completed in time';
  } else if (gameStore.synchronized && gameStore.week === gameStore.maxWeek) {
    return gameStore.ready ? 'You are ready (Click to unready)' : 'You are not ready (Click to ready)';
  } else {
    return `Next ${config.durationIdentifier.singular} ->`;
  }
});

const handleClick = () => {
  if (gameStore.synchronized && gameStore.week === gameStore.maxWeek) {
    gameStore.toggleReady();
  } else {
    gameStore.nextWeek();
  }
};
</script>

<!-- Styling -->

<style scoped lang="postcss">
.done-button {
  text-align: center;
  font-size: 1rem;
}
</style>
