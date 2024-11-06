<!-- 
  Bid (Decision Form)

  The Bid is a simple box statically showing the bid made by the player(s).
-->

<template>
  <div :class="['bid', { 'bid-wide': !gameStore.config.loansEnabled }]">
    <h3 class="bid-column-label">Bid</h3>
    <span :class="bidStore.revised ? 'rejected-bid-label' : 'accepted-bid-label'">{{
      currencyFormat(gameStore.config).format(bidStore.price)
    }}</span>
    <span class="accepted-bid-label"
      >{{ bidStore.promisedDuration }} {{ gameStore.config.durationIdentifier.plural }}</span
    >
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { currencyFormat } from '~/utils/formatters';

const gameStore = useGameStore();
const bidStore = useBidStore();
</script>

<!-- Styling -->

<style scoped lang="postcss">
.bid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bid-wide {
  grid-column: span 2;
}

.rejected-bid-label {
  text-align: left;
  color: red;
}

.accepted-bid-label {
  text-align: left;
}
</style>
