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
const gameStore = useGameStore();

const buttonText = computed(() => {
  if (gameStore.gameOver) {
    return gameStore.gameWon ? 'Project Completed' : 'Project not completed in time';
  } else if (gameStore.synchronized && gameStore.week === gameStore.game!.current_week) {
    return gameStore.ready ? 'You are ready (Click to unready)' : 'You are not ready (Click to ready)';
  } else {
    return `Next ${gameStore.config.durationIdentifier.singular} ->`;
  }
});

const handleClick = () => {
  if (gameStore.synchronized && gameStore.week === gameStore.game!.current_week) {
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
