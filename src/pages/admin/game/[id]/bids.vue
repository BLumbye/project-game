<template>
  <h2>Bid Submissions ({{ currentGameData.bids.length }}/{{ currentGameData.users.length }})</h2>
  <p v-if="currentGameData.bids.length === 0" class="no-submissions">No submissions yet...</p>
  <BidTable v-else class="bid-table" />
</template>

<script setup lang="ts">
import { AdminData } from '~/hooks/adminData';

const currentGameData = inject<Ref<AdminData>>('currentGameData')!;
</script>

<style scoped lang="postcss">
.bid-table,
.no-submissions {
  margin-top: 1rem;
}
</style>
