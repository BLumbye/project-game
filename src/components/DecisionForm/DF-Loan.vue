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
      <Info width="24" height="24" class="icon" />
      <v-tooltip activator="parent" location="top">
        <p>Only one loan can be taken at a time.</p>
        <p>You can repay loan in percentages, and can never repay more than you have loaned.</p>
      </v-tooltip>
    </div>
    <label for="new-loan-input" class="loan-label">New loan:</label>
    <input
      id="new-loan-input"
      v-model="newLoan"
      v-tooltip="{
        content: 'You can only take one loan at a time.',
        disabled: newLoan === 0 || !financeStore.hasActiveLoan(),
      }"
      type="text"
      :disabled="gameStore.ready"
      class="loan-input"
      :class="{ 'input-error': newLoan > 0 && financeStore.hasActiveLoan() }"
      name="new-loan-input"
      @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
    />
    <label for="repay-input" class="loan-label">Repay amount:</label>
    <input
      id="repay-input"
      v-model="repay"
      v-tooltip="{
        content:
          'It seems like you might be trying to repay in percentages. If you wish to do so, rememember to add &quot;%&quot; at the end of the input.',
        disabled: !repayWarning,
      }"
      type="text"
      :disabled="gameStore.ready"
      class="loan-input"
      :class="{
        'input-warning': repayWarning,
      }"
      name="repay-input"
    />
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

const repayWarning = computed(
  () =>
    !repay.value.includes('%') && !isNaN(Number(repay.value)) && Number(repay.value) > 0 && Number(repay.value) <= 100,
);

watch(newLoan, () => {
  financeStore.takeLoan(Number(newLoan.value));
});

watch(repay, () => {
  financeStore.repayLoan(repay.value);
});

watch(
  () => gameStore.week,
  () => {
    newLoan.value = 0;
    repay.value = '0';
  },
);

watch(
  () => financeStore.loading,
  () => {
    newLoan.value = financeStore.loanTimeline.get(gameStore.week + 1) || 0;
    repay.value = financeStore.loanRepayTimeline.get(gameStore.week + 1)?.toString() || '0';
  },
  { immediate: true },
);
</script>

<!-- Styling -->

<style scoped lang="postcss">
.loan {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(3, auto);
  gap: 4px 0.5rem;
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
