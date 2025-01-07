<template>
  <template v-if="!gameStore.loaded">
    <p>Loading...</p>
  </template>
  <template v-else>
    <GameHeader />
    <!-- <ConfettiExplosion v-if="gameStore.gameWon"
                     :duration="4000"
                     :stageHeight="1200" /> -->
    <template v-if="gameStore.synchronized && gameStore.game!.game_state === 'adding_users'">
      <h2 class="big-text">Wait for the survey submissions to open.</h2>
    </template>
    <template v-else-if="gameStore.synchronized && gameStore.game!.game_state === 'getting_bids'">
      <Survey />
    </template>
    <template v-else-if="gameStore.synchronized && gameStore.game!.game_state === 'reviewing_bids'">
      <h2 class="big-text">Survey submissions has been closed. The game is about to start.</h2>
    </template>
    <template v-else-if="!gameStore.synchronized || gameStore.game!.game_state === 'in_progress'">
      <Event />
      <div class="container">
        <WeeklyReport v-if="gameStore.week > 1" />
        <h2 v-else>
          No {{ gameStore.config.durationIdentifier.iterative }} report in
          {{ gameStore.config.durationIdentifier.singular }}
          {{ gameStore.week }}
        </h2>
        <DecisionForm v-if="!gameStore.gameOver" />
        <GameFinished v-if="gameStore.gameOver" />
      </div>
    </template>
    <template v-else>
      <h2 class="big-text">The game is now finished.</h2>
    </template>
  </template>
</template>

<!-- Script -->

<script setup lang="ts">
import { isAdmin } from '~/pocketbase';

if (isAdmin()) {
  console.log('redirecting from game...');
  useRouter().push('/admin');
}

const gameStore = useGameStore();
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

  @media (width <=1050px) {
    flex-direction: column;
    align-items: center;
    gap: 2rem;

    & > .decision-form {
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
