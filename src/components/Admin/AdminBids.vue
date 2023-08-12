<template>
  <h3>Bid Submissions</h3>
  <div class="bids-status">
    <p>Submissions: {{ adminStore.bids.length }}/{{ adminStore.users.length }}</p>
    <button v-if="gameStore.gameState === 'getting_bids'"
            @click="adminStore.stopAcceptingBids">Close Submissions</button>
    <button v-else-if="gameStore.gameState === 'reviewing_bids'"
            @click="adminStore.acceptBids">Start Game</button>
  </div>
  <p v-if="adminStore.bids.length === 0">No submissions yet...</p>
  <BidTable v-else />
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
  min-width: 500px;
  margin-bottom: 1rem;
}
</style>