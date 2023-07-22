<!--
  Bid page 

  The bid page is where the player(s) put their initial bid. 

  The bid consists of a Price and Duration
  and they determine the money available through the game and the time limit respectively. 
-->

<template>
  <div class="bid-page">
    <h3 class="bid-headline">BID ({{ 'username' }})</h3>
    <div class="bid-container">
      <div class="labels">
        <div class="bid-label">Price:</div>
        <div class="bid-label">Duration:</div>
        <div class="bid-label">Expected cost:</div>
        <div class="bid-label">Expected duration:</div>
      </div>
      <div class="inputs">
        <input type="text"
               class="bid-input"
               name="bid-price-input"
               ref="bid-price"
               @keypress="validateFieldIsDigit"
               @input="(evt) => change(evt, 'bidPrice')" />
        <input type="text"
               class="bid-input"
               name="bid-duration-input"
               ref="bid-duration"
               @keypress="validateFieldIsDigit"
               @input="(evt) => change(evt, 'bidDuration')" />
        <input type="text"
               class="bid-input"
               name="expected-price-input"
               ref="expected-price"
               @keypress="validateFieldIsDigit"
               @input="(evt) => change(evt, 'expectedPrice')" />
        <input type="text"
               class="bid-input"
               name="expected-duration-input"
               ref="expected-duration"
               @keypress="validateFieldIsDigit"
               @input="(evt) => change(evt, 'expectedDuration')" />
      </div>
    </div>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { validateFieldIsDigit } from '../../utils/validateField';
import {bidType} from '../../types/types'

const bidStore = useBidStore();

const change = (evt: Event, bid: bidType) => {
  bidStore.updateBid(bid, Number((evt.target as HTMLInputElement).value));
}

</script>

<!-- Styling -->

<style scoped lang="postcss">
.bid-page {
  text-align: center;
}

.bid-container {
  display: flex;
  justify-content: center; 
}

.labels {
  display: flex;
  flex-direction: column;
}

.bid-label {
  text-align: left;
  margin-bottom: 10px;
  margin-right: 15px;
  white-space: nowrap;
}

.inputs {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 10px;
}

.bid-input {
  width: 200px;
}
</style>
