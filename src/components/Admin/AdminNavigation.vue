<template>
  <nav>
    <router-link to="/admin/users">Users</router-link>
    <AdminNavigationLink to="/admin/bids" :disabled="!bidsEnabled">Bids</AdminNavigationLink>
    <AdminNavigationLink to="/admin/survey" :disabled="!surveyEnabled">Survey answers</AdminNavigationLink>
    <AdminNavigationLink to="/admin/game-progress" :disabled="!gameProgressEnabled">Game progress</AdminNavigationLink>
    <AdminNavigationLink to="/admin/results" :disabled="!resultsEnabled">Results</AdminNavigationLink>
  </nav>
</template>

<script setup lang="ts">
const gameStore = useGameStore();

const bidsEnabled = computed(() => gameStore.gameState !== 'adding_users');
const surveyEnabled = computed(() => gameStore.gameState !== 'adding_users');
const gameProgressEnabled = computed(() => gameStore.gameState === 'in_progress');
const resultsEnabled = computed(() => gameStore.gameState === 'finished');
</script>

<style scoped lang="postcss">
nav {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  background-color: var(--boxed-background-color);
  height: 100%;
  min-width: 200px;
  text-align: left;
  padding: 1rem;
  border-top: 1px solid var(--background-color);

  & >>> a,
  & >>> span {
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: var(--text-color);
    font-weight: 400;
    border-radius: 4px;
    transition: background-color 0.1s ease-in-out;

    &:hover:not(.router-link-disabled),
    &.router-link-active {
      background-color: var(--background-color);
    }

    &.router-link-active {
      font-weight: 500;
    }

    &.router-link-disabled {
      opacity: 0.2;
      cursor: default;
    }
  }
}
</style>
