<template>
  <h3 class="bid-column-label">Bid</h3>
  <div class="bid">
    <label for="bid-price-input" class="bid-label">Price</label>
    <input type="number" class="bid-input" name="bid-price-input" />
    <label for="bid-duration-input" class="bid-label">Duration</label>
    <input type="number" class="bid-input" name="bid-suration-input" />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="postcss">
.bid {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(2, auto);
}

.component-title {
  grid-column: span 2;
}

.bid-label {
  text-align: left;
}

.bid-column-label{
  font-style: bold;  /* no bold? */
}
</style>
