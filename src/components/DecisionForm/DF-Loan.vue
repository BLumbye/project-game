<!-- 
  Loan (Decision Form)

  Loan allows palyer to take a loan and repay a loan. 
  Only one loan can be taken at a time. 
  Interest rates are located in the Config file. 
-->

<template>
  <div class="loan">
    <div class="component-title">
      <h3>Bank loan</h3>
      <Info width="24"
            height="24"
            class="icon" />
      <v-tooltip activator="parent"
                 location="top">
        <p>Only one loan can be taken at a time.</p>
        <p>You can repay loan in percentages, and can never repay more than you have loaned.</p>
      </v-tooltip>
    </div>
    <label for="new-loan-input"
           class="loan-label">New loan:</label>
    <input v-model="newLoan"
           type="text"
           :disabled="gameStore.ready"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
           class="loan-input"
           :class="{ 'input-error': newLoan > 0 && financeStore.hasActiveLoan() }"
           v-tooltip="{ content: 'You can only take one loan at a time.', disabled: newLoan === 0 || !financeStore.hasActiveLoan() }"
           id="new-loan-input"
           name="new-loan-input" />
    <label for="repay-input"
           class="loan-label">Repay amount:</label>
    <input type="text"
           v-model="repay"
           :disabled="gameStore.ready"
           class="loan-input"
           id="repay-input"
           name="repay-input" />
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { and, asNumber, isNumber, isPositive, isWholeNumber, validate } from '~/utils/validation';
import Info from '~/assets/info-large.svg';

const gameStore = useGameStore();
const financeStore = useFinanceStore();

const newLoan = ref(0);
const repay = ref('0');

watch(newLoan, () => {
  financeStore.takeLoan(Number(newLoan.value));
});

watch(repay, () => {
  financeStore.repayLoan(repay.value);
});

watch(() => gameStore.week, () => {
  newLoan.value = 0;
  repay.value = '0';
})

watch(() => financeStore.loading, () => {
  newLoan.value = financeStore.loanTimeline.get(gameStore.week + 1) || 0;
  repay.value = financeStore.loanRepayTimeline.get(gameStore.week + 1)?.toString() || '0';
}, { immediate: true });
</script>

<!-- Styling -->

<style scoped lang="postcss">
.loan {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(3, auto);
  row-gap: 4px;
  column-gap: 0.5rem;
}

.component-title {
  grid-column: span 2;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5rem;
}

.loan-label {
  text-align: left;
}
</style>
