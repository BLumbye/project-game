<!--
  Bid page 

  The bid page is where the player(s) put their initial bid. 

  The bid consists of a Price and Duration
  and they determine the money available through the game and the time limit respectively. 
-->

<template>
  <h1>Project Game</h1>
  <h2 v-if="bidStore.loading">Loading...</h2>
  <template v-else>
    <h2 class="bid-headline">BID {{ gameStore.synchronized ? `(${pocketbase.authStore.model!.username})` : '' }}</h2>
    <div class="bid-container">
      <div class="inputs">
        <label for="bid-price">Price:</label>
        <input type="text"
               class="bid-input"
               id="bid-price"
               name="bid-price"
               :disabled="isReady"
               @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
               @input="(evt) => change(evt, 'bidPrice')"
               :value="bidStore.bidPrice" />
        <label for="bid-duration">Duration:</label>
        <input type="text"
               class="bid-input"
               id="bid-duration"
               name="bid-duration"
               :disabled="isReady"
               @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
               @input="(evt) => change(evt, 'bidDuration')"
               :value="bidStore.bidDuration" />
        <label for="expected-price">Expected cost:</label>
        <input type="text"
               class="bid-input"
               id="expected-price"
               name="expected-price"
               :disabled="isReady"
               @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
               @input="(evt) => change(evt, 'expectedPrice')"
               :value="bidStore.expectedPrice" />
        <label for="expected-duration">Expected duration:</label>
        <input type="text"
               class="bid-input"
               id="expected-duration"
               name="expected-duration"
               :disabled="isReady"
               @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
               @input="(evt) => change(evt, 'expectedDuration')"
               :value="bidStore.expectedDuration" />
      </div>
    </div>
    <button @click="handleContinue"
            class="ready-button"
            :disabled="!bidStore.isBidValid">{{ gameStore.synchronized ? isReady ? 'Not Ready' : 'Ready' : 'Continue'
            }}</button>
    <p v-if="isReady">Wait for the admins to accept your bid and continue the game</p>
  </template>
</template>

<!-- Script -->

<script setup lang="ts">
import { and, asNumber, isNumber, isPositive, isWholeNumber, validate } from '~/utils/validation';
import { bidType } from '../../types/types'
import { pocketbase } from '~/pocketbase';

const bidStore = useBidStore();
const gameStore = useGameStore();
const router = useRouter();

const isReady = ref(false);

const change = (evt: Event, bid: bidType) => {
  bidStore.updateBid(bid, Number((evt.target as HTMLInputElement).value));
}

const handleContinue = () => {
  if (gameStore.synchronized) {
    isReady.value = !isReady.value;
    if (gameStore.bidsAccepted) {
      router.push('/game');
    }
  } else {
    router.push('/game');
  }
}

watch(() => gameStore.bidsAccepted, () => {
  if (gameStore.bidsAccepted) {
    router.push('/game');
  }
});
</script>

<!-- Styling -->

<style scoped lang="postcss">
.inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;

  & label {
    text-align: left;
    white-space: nowrap;
  }

  & input {
    width: 200px;
  }
}

.ready-button {
  margin-top: 2rem;
  margin-bottom: 1rem;
}
</style>
