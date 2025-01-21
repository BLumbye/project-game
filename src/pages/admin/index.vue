<template>
  <p v-if="isGameInProgress">
    A game is currently running. You can find access it
    <router-link :to="`/admin/game/${adminStore.newestGame?.game_id}`">here</router-link>.
  </p>
  <AdminNotStarted v-else />
</template>

<script setup lang="ts">
const adminStore = useAdminStore();
const isGameInProgress = computed(() => adminStore.games.some((game) => game.game_state !== 'finished'));
</script>
