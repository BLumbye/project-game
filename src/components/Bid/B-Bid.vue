<template>
  <div class="bid-page">
    <h3 class="bid-label">Bid</h3>
    <div class="bid">
      <span class="bid-label">Bid price: </span>
      <input type="text"
             class="bid-input"
             name="bid-price-input"
             ref="price"
             @keypress="validateFieldIsDigit" />
      <span class="bid-label">Bid duration: {{ bidStore.duration }}</span>
      <input type="text"
             class="bid-input"
             name="bid-duration-input"
             ref="duration"
             @keypress="validateFieldIsDigit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBidStore } from '../../stores/bidStore';
import { validateFieldIsDigit } from '../../utils/validateField';

const bidStore = useBidStore();

</script>

<style scoped lang="postcss">
.bid-page {
  text-align: center;
}

.bid {
  display: flex;
  flex-direction: column;
}

.bid-label {
  text-align: left;
}
</style>
