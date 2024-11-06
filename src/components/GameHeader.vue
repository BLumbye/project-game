<template>
  <header>
    <span class="title">Project Game</span>
    <span>{{ pageTitle }}</span>
    <div v-if="pocketbase.authStore.isValid" class="right-side">
      <span>{{ pocketbase.authStore.model!.username }}</span>
      <button class="logout-button" @click="logout()">Log out</button>
    </div>
    <div v-else class="right-side">
      <span>Guest</span>
      <RestartGame />
    </div>
  </header>
</template>

<script setup lang="ts">
import { pocketbase, isAdmin } from '~/pocketbase';
import { capitalize } from '~/utils/formatters';

const pageTitle = computed(() => {
  if (isAdmin()) return 'Admin Panel';
  const gameStore = useGameStore();
  if (!gameStore.synchronized || gameStore.game!.game_state === 'in_progress')
    return `${capitalize(gameStore.config.durationIdentifier.singular)} ${gameStore.week}`;
  else if (gameStore.game!.game_state === 'finished') return 'Game Over';
  else if (['getting_bids', 'reviewing_bids'].includes(gameStore.game!.game_state)) return 'Pre-Game Survey';
});
const router = useRouter();

function logout() {
  pocketbase.authStore.clear();
  router.push('/');
}
</script>

<style scoped lang="postcss">
.right-side {
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  gap: 1rem;
}

header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  width: 100%;
  background-color: var(--boxed-background-color);

  & > * {
    flex: 1;
  }
}

span {
  font-size: 20px;
  font-weight: 500;
}

.title {
  font-weight: bold;
  text-align: left;
}
</style>

<style lang="postcss">
#app {
  padding-top: 0 !important;
}
</style>
