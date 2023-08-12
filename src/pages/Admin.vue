<template>
  <GameHeader />
  <main>
    <AdminNotStarted v-if="!gameStore.synchronized" />
    <AdminAddingUsers v-else-if="gameStore.gameState === 'adding_users'" />
    <AdminBids v-else-if="gameStore.gameState === 'getting_bids' || gameStore.gameState === 'reviewing_bids'" />
    <AdminInProgress v-else-if="gameStore.gameState === 'in_progress'" />
  </main>
</template>

<script setup lang="ts">
import { isAdmin, pocketbase } from '~/pocketbase';

const gameStore = useGameStore();

if (!pocketbase.authStore.isValid || !isAdmin()) {
  console.log('redirecting from admin...');
  gameStore.connectAllDatabases();
  gameStore.routeCorrectly();
}
</script>

<style scoped lang="postcss">
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}
</style>

  
<route>
{
  name: "admin"
}
</route>