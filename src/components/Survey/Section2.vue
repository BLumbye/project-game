<template>
  <h2 class="section-title">Bid information</h2>
  <div class="question">
    <label class="prompt"
           for="price">
      Price (in EUR):
    </label>
    <input type="text"
           id="price"
           name="price"
           :class="{ 'input-error': priceError }"
           v-model="price"
           @input="() => priceError = undefined"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)" />
    <span class="error-message"
          v-if="priceError">{{ priceError }}</span>
  </div>
  <div class="question">
    <label class="prompt"
           for="promised-duration">
      Promised duration (number of weeks, i.e. you promise your client that project will be completed by the end of
      which week):
    </label>
    <input type="text"
           id="promised-duration"
           name="promised-duration"
           :class="{ 'input-error': promisedDurationError }"
           v-model="promisedDuration"
           @input="() => promisedDurationError = undefined"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)" />
    <span class="error-message"
          v-if="promisedDurationError">{{ promisedDurationError }}</span>
  </div>
  <div class="question">
    <label class="prompt"
           for="expected-cost">
      Expected cost (in EUR) - This will not influence the measurement of success, and it is only used so we know
      whether your calculations are more or less correct:
    </label>
    <input type="text"
           id="expected-cost"
           name="expected-cost"
           :class="{ 'input-error': expectedCostError }"
           v-model="expectedCost"
           @input="() => expectedCostError = undefined"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)" />
    <span class="error-message"
          v-if="expectedCostError">{{ expectedCostError }}</span>
  </div>
  <div class="question">
    <label class="prompt"
           for="expected-duration">
      Expected duration (in weeks) - This will not influence the measurement of success:
    </label>
    <input type="text"
           id="expected-duration"
           name="expected-duration"
           :class="{ 'input-error': expectedDurationError }"
           v-model="expectedDuration"
           @input="() => expectedDurationError = undefined"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)" />
    <span class="error-message"
          v-if="expectedDurationError">{{ expectedDurationError }}</span>
  </div>
</template>

<script setup lang="ts">
import { and, asNumber, isNumber, isPositive, isWholeNumber, validate } from '~/utils/validation';

const price = ref<number | undefined>();
const promisedDuration = ref<number | undefined>();
const expectedCost = ref<number | undefined>();
const expectedDuration = ref<number | undefined>();

const priceError = ref<string | undefined>();
const promisedDurationError = ref<string | undefined>();
const expectedCostError = ref<string | undefined>();
const expectedDurationError = ref<string | undefined>();

defineExpose({
  getData() {
    return {
      price: price.value,
      promised_duration: promisedDuration.value,
      expected_cost: expectedCost.value,
      expected_duration: expectedDuration.value,
    }
  },
  errorCheck() {
    let error = false;
    if (price.value === undefined || price.value <= 0) {
      priceError.value = 'Please enter a price';
      error = true;
    }
    if (promisedDuration.value === undefined || promisedDuration.value <= 0) {
      promisedDurationError.value = 'Please enter a promised duration';
      error = true;
    }
    if (expectedCost.value === undefined || expectedCost.value <= 0) {
      expectedCostError.value = 'Please enter an expected cost';
      error = true;
    }
    if (expectedDuration.value === undefined || expectedDuration.value <= 0) {
      expectedDurationError.value = 'Please enter an expected duration';
      error = true;
    }
    return error;
  }
});
</script>

<style scoped lang="postcss"></style>