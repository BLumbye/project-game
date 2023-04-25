<!-- 
  Bid (Decision Form)

  The Bid is a simple box statically showing the bid made by the player(s).
-->

<template>
  <div class="bid">
    <h3 class="bid-column-label">Bid</h3>
    <span class="bid-label">Price: {{ bidStore.price }}</span>
    <span class="bid-label">Duration: {{ bidStore.duration }}</span>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { useBidStore } from '../../stores/bidStore';

const bidStore = useBidStore();
</script>

<!-- Styling -->

<style scoped lang="postcss">
.bid {
  display: flex;
  flex-direction: column;
}

.bid-label {
  text-align: left;
}
</style>
