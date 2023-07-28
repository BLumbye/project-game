<template>
  <h3>Bids</h3>
  <div class="bids-status">
    <p>Ready: {{ adminStore.bids.filter(bid => bid.ready).length }}/{{ adminStore.users.length }}</p>
    <button v-if="gameStore.gameState === 'getting_bids'"
            @click="adminStore.stopAcceptingBids">Close Submissions</button>
    <button v-else-if="gameStore.gameState === 'reviewing_bids'"
            @click="adminStore.acceptBids">Start Game</button>
  </div>
  <BidTable />
</template>

<script setup lang="ts">
const gameStore = useGameStore();
const adminStore = useAdminStore();
</script>

<style scoped lang="postcss">
.bids-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
}
</style>