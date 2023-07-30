<!-- 
  Bid (Decision Form)

  The Bid is a simple box statically showing the bid made by the player(s).
-->

<template>
  <div class="bid">
    <h3 class="bid-column-label">Bid</h3>
    <span class="bid-label">Price: {{ bidStore.bidPrice }}</span>
    <span class="bid-label">Duration: {{ bidStore.bidDuration }}</span>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
const bidStore = useBidStore();
</script>

<!-- Styling -->

<style scoped lang="postcss">
.bid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bid-label {
  text-align: left;
}

.bid-column-label {
  margin-bottom: .5rem;
}
</style>
