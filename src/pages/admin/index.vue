<template>
  <p v-if="isGameInProgress">
    A game is currently running. You can find access it
    <router-link :to="`/game/${gameInProgressId}`">here</router-link>.
  </p>
  <AdminNotStarted v-else />
</template>

<script setup lang="ts">
const adminStore = useAdminStore();
const isGameInProgress = computed(() => adminStore.games.some((game) => game.game_state !== 'finished'));
const gameInProgressId = computed(() => adminStore.games.find((game) => game.game_state !== 'finished')?.game_id);
</script>
