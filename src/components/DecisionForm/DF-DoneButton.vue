<!-- 
  Next Week (Decision Form)

  Next Week is a simple button which progresses the game one week when clicked.
-->

<template>
  <button class="done-button"
          @click="handleClick"
          :disabled="gameStore.gameOver">
    {{ gameStore.gameOver ? gameStore.gameWon ? "Project Completed" :
      "Project not completed in time" : gameStore.synchronized ?
      gameStore.ready ? "Not ready" : "Ready" : "Next Week ->" }}
  </button>
</template>

<!-- Script -->

<script setup lang="ts">
const gameStore = useGameStore();

const handleClick = () => {
  if (gameStore.synchronized) {
    gameStore.toggleReady();
  } else {
    gameStore.nextWeek();
  }
}

</script>

<!-- Styling -->

<style scoped lang="postcss">
.done-button {
  text-align: center;
  font-size: 1rem;
}
</style>
