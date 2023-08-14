<template>
  <h2>Bid Submissions ({{ adminStore.bids.length }}/{{ adminStore.users.length }})</h2>
  <p class="no-submissions"
     v-if="adminStore.bids.length === 0">No submissions yet...</p>
  <BidTable class="bid-table"
            v-else />
</template>

<script setup lang="ts">
const gameStore = useGameStore();
const adminStore = useAdminStore();
</script>

<style scoped lang="postcss">
.bid-table,
.no-submissions {
  margin-top: 1rem;
}
</style>