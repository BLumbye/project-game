<template>
  <GameHeader />
  <template v-if="gameStore.gameState === 'adding_users'">
    <h2>Wait for the game to start</h2>
  </template>
  <template v-else-if="gameStore.gameState === 'getting_bids' || gameStore.gameState === 'reviewing_bids'">
    <Bid />
  </template>
  <template v-else-if="gameStore.gameState === 'in_progress'">
    <Event />
    <div class="container">
      <WeeklyReport v-if="gameStore.week > 1" />
      <h2 v-else>No weekly report in week {{ gameStore.week }}</h2>
      <DecisionForm />
      <GameFinishDialog />
    </div>
  </template>
  <template v-else>
    <h2>Game Finished</h2>
  </template>
</template>

<!-- Script -->

<script setup lang="ts">
const gameStore = useGameStore();

if (!gameStore.synchronized) {
  gameStore.gameState = 'getting_bids';
}
</script>

<!-- Styling -->

<style scoped lang="postcss">
.container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
  gap: 1rem;
}
</style>

<route>
{
  name: "game"
}
</route>