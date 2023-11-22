<template>
  <GameHeader />
  <!-- <ConfettiExplosion v-if="gameStore.gameWon"
                     :duration="4000"
                     :stageHeight="1200" /> -->
  <template v-if="gameStore.gameState === 'adding_users'">
    <h2 class="big-text">Wait for the survey submissions to open.</h2>
  </template>
  <template v-else-if="gameStore.gameState === 'getting_bids'">
    <Survey />
  </template>
  <template v-else-if="gameStore.gameState === 'reviewing_bids'">
    <h2 class="big-text">Survey submissions has been closed. Wait for the game to start.</h2>
  </template>
  <template v-else-if="bidStore.price === 0">
    <h2 class="big-text">You did not submit a bid in time, and can therefore not participate in the game.</h2>
  </template>
  <template v-else-if="gameStore.gameState === 'in_progress'">
    <Event />
    <div class="container">
      <WeeklyReport v-if="gameStore.week > 1" />
      <h2 v-else>No weekly report in week {{ gameStore.week }}</h2>
      <DecisionForm v-if="!gameStore.gameOver"/>
      <GameFinished v-if="gameStore.gameOver"/>
    </div>
  </template>
  <template v-else>
    <h2 class="big-text">The game is now finished.</h2>
  </template>
</template>

<!-- Script -->

<script setup lang="ts">
import { isAdmin, pocketbase } from '~/pocketbase';
// @ts-ignore
import ConfettiExplosion from 'vue-confetti-explosion';

const gameStore = useGameStore();
const bidStore = useBidStore();

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
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1rem;

  @media (max-width: 1050px) {
    flex-direction: column;
    align-items: center;
    gap: 2rem;

    &>.decision-form {
      order: -1;
    }
  }
}

.big-text {
  margin-top: 2rem;
}
</style>

<route>
{
  name: "game"
}
</route>
