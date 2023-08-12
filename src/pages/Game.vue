<template>
  <GameHeader />
  <template v-if="gameStore.gameWon">
    <ConfettiExplosion :duration="4000" :stageHeight="1200" />
  </template>
  <template v-if="gameStore.gameState === 'adding_users'">
    <h2>Wait for the game to start</h2>
  </template>
  <template v-else-if="gameStore.gameState === 'getting_bids' || gameStore.gameState === 'reviewing_bids'">
    <Survey />
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
<<<<<<< HEAD
import { isAdmin, pocketbase } from '~/pocketbase';
=======
import ConfettiExplosion from 'vue-confetti-explosion';
>>>>>>> 11685fd69fec8f919ed8d8f13b453c01d39198a5

const gameStore = useGameStore();

if ((gameStore.synchronized && !pocketbase.authStore.isValid) || isAdmin()) {
  console.log('redirecting from game...');
  gameStore.routeCorrectly();
}

if (!gameStore.synchronized) {
  gameStore.gameState = 'in_progress';
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

  @media (max-width: 1050px) {
    flex-direction: column;
    align-items: center;
    gap: 2rem;

    & > .decision-form {
      order: -1;
    }
  }
}
</style>

<route>
{
  name: "game"
}
</route>
