<template>
  <main>
    <h1>Project Game</h1>
    <h2>Admin Panel</h2>
    <AdminNotStarted v-if="!gameStore.synchronized" />
    <AdminAddingUsers v-else-if="gameStore.gameState === 'adding_users'" />
    <AdminBids v-else-if="gameStore.gameState === 'getting_bids' || gameStore.gameState === 'reviewing_bids'" />
    <AdminInProgress v-else-if="gameStore.gameState === 'in_progress'" />
  </main>
</template>

<script setup lang="ts">
const gameStore = useGameStore();
const adminStore = useAdminStore();
</script>

<style scoped lang="postcss">
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

  
<route>
{
  name: "admin"
}
</route>