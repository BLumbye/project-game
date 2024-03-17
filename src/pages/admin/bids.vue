<template>
  <h2>Bid Submissions ({{ adminStore.bids.length }}/{{ adminStore.users.length }})</h2>
  <p v-if="adminStore.bids.length === 0" class="no-submissions">No submissions yet...</p>
  <BidTable v-else class="bid-table" />
</template>

<script setup lang="ts">
const adminStore = useAdminStore();
</script>

<style scoped lang="postcss">
.bid-table,
.no-submissions {
  margin-top: 1rem;
}
</style>
