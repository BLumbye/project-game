<template>
  <div class="bid">
    <h3 class="bid-header">Bid</h3>
    <span class="bid-column-label">Bid</span>
    <label for="bid-cost-input" class="bid-label">Cost</label>
    <input type="number" class="bid-input" name="bid-cost-input" />
    <label for="bid-time-input" class="bid-label">Time</label>
    <input type="number" class="bid-input" name="bid-time-input" />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="postcss">
.bid {
  display: grid;
  grid-template-columns: repeat(1, auto);
  grid-template-rows: repeat(3, auto);
}

.component-title {
  grid-column: span 2 / span 2;
}

.bid-label {
  text-align: left;
}
</style>
