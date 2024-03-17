<template>
  <h2 v-show="show" class="section-title">Bid information</h2>
  <div v-show="show" class="question">
    <label class="prompt" for="price"> Price (in {{ config.currency.currency }}): </label>
    <input
      id="price"
      v-model="price"
      type="text"
      name="price"
      :class="{ 'input-error': priceError }"
      @input="() => (priceError = undefined)"
      @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
    />
    <span v-if="priceError" class="error-message">{{ priceError }}</span>
  </div>
  <div v-show="show" class="question">
    <label class="prompt" for="promised-duration">
      Promised duration (number of {{ config.durationIdentifier.plural }}, i.e. you promise your client that project
      will be completed by the end of which {{ config.durationIdentifier.singular }}):
    </label>
    <input
      id="promised-duration"
      v-model="promisedDuration"
      type="text"
      name="promised-duration"
      :class="{ 'input-error': promisedDurationError }"
      @input="() => (promisedDurationError = undefined)"
      @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
    />
    <span v-if="promisedDurationError" class="error-message">{{ promisedDurationError }}</span>
  </div>
  <div v-show="show" class="question">
    <label class="prompt" for="expected-cost">
      Expected cost (in {{ config.currency.currency }}) - This will not influence the measurement of success, and it is
      only used so we know whether your calculations are more or less correct:
    </label>
    <input
      id="expected-cost"
      v-model="expectedCost"
      type="text"
      name="expected-cost"
      :class="{ 'input-error': expectedCostError }"
      @input="() => (expectedCostError = undefined)"
      @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
    />
    <span v-if="expectedCostError" class="error-message">{{ expectedCostError }}</span>
  </div>
  <div v-show="show" class="question">
    <label class="prompt" for="expected-duration">
      Expected duration (in {{ config.durationIdentifier.plural }}) - This will not influence the measurement of
      success:
    </label>
    <input
      id="expected-duration"
      v-model="expectedDuration"
      type="text"
      name="expected-duration"
      :class="{ 'input-error': expectedDurationError }"
      @input="() => (expectedDurationError = undefined)"
      @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
    />
    <span v-if="expectedDurationError" class="error-message">{{ expectedDurationError }}</span>
  </div>
</template>

<script setup lang="ts">
import { and, asNumber, isNumber, isPositive, isWholeNumber, validate } from '~/utils/validation';
import config from '~/config';

const price = ref<number | undefined>();
const promisedDuration = ref<number | undefined>();
const expectedCost = ref<number | undefined>();
const expectedDuration = ref<number | undefined>();

const priceError = ref<string | undefined>();
const promisedDurationError = ref<string | undefined>();
const expectedCostError = ref<string | undefined>();
const expectedDurationError = ref<string | undefined>();

defineProps<{
  show: boolean;
}>();

defineExpose({
  getData() {
    return {
      price: price.value,
      promised_duration: promisedDuration.value,
      expected_cost: expectedCost.value,
      expected_duration: expectedDuration.value,
    };
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
  },
});
</script>

<style scoped lang="postcss"></style>
