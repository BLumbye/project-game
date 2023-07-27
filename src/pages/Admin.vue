<template>
  <main>
    <h1>Project Game</h1>
    <h2>Admin Panel</h2>
    <div v-if="!gameStore.synchronized"
         class="unsynchronized">
      <p>No synchronized game is currently in progress, click below to start a game. Doing
        this will disallow free play while the game is in progress.</p>
      <button @click="adminStore.startGame">Start Game</button>
    </div>
    <div v-else>
      <p class="game-state">Game State: {{ 'hej' }}</p>
    </div>
  </main>
</template>
  
<!-- Script -->

<script setup lang="ts">
const gameStore = useGameStore();
const adminStore = useAdminStore();
</script>

<!-- Styling -->

<style scoped lang="postcss">
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.unsynchronized {
  width: clamp(300px, 80%, 600px);
  text-align: center;

  & p {
    margin-bottom: 1rem;
  }
}
</style>

  
<route>
{
  name: "admin"
}
</route>