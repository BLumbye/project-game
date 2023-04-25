<!-- 
  Finances (Weekly Report)

  The Finances is where all financial information from previous weeks are shown.
  This report summarizes the project in terms of:
    Outgoing: Wages paid, equipment costs, overhead, delay fees, etc.
    Incoming: Initial payment, loans, milestone payments, etc.
-->

<template>
  <div class="finances boxed">
    <h3>Finance</h3>
    <div class="weekly">
      <h4>Weekly</h4>
      <div class="outgoing">
        <h5>Outgoing</h5>
        <div class="finance-item">
          <span class="finance-item-label">Workers</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.workersTimeline[week - 1] || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Equipment</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.equipmentTimeline[week - 1] || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Overhead</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.overheadTimeline[week - 1] || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Consumables</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.consumablesTimeline[week - 1] || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Project delay penalty</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.delayPenaltyTimeline[week - 1] || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Interest loan</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.loanInterestTimeline[week - 1] || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Interest overdraft</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.overdraftInterestTimeline[week - 1] || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan payback</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.loanPaybackTimeline[week - 1] || 0)
          }}</span>
        </div>
      </div>
      <div class="incoming">
        <h5>Incoming</h5>
        <div class="finance-item">
          <span class="finance-item-label">Income</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.incomingTimeline[week - 1] || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan</span>
          <span class="finance-item-value">{{ currencyFormat.format((financeStore.loanTimeline[week - 1] || 0) -
            (financeStore.loanInterestTimeline[week - 1] || 0)) }}</span>
        </div>
      </div>
      <div class="finance-item summary-item">
        <span class="finance-item-label">Weekly balance:</span>
        <span class="finance-item-value">{{ currencyFormat.format(financeStore.weeklyBalanceAtWeek(week - 1)) }}</span>
      </div>
    </div>
    <hr />
    <div class="total">
      <h4>Total</h4>
      <div class="outgoing">
        <h5>Outgoing</h5>
        <div class="finance-item">
          <span class="finance-item-label">Workers</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.workersAtWeek(week - 1) || 0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Equipment</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.equipmentAtWeek(week - 1) || 0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Overhead</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.overheadAtWeek(week - 1) || 0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Consumables</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.consumablesAtWeek(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Project delay penalty</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.delayPenaltyAtWeek(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Interest loan</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.loanInterestAtWeek(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Interest overdraft</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.overdraftInterestAtWeek(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan payback</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.loanPaybackAtWeek(week - 1) || 0)
          }}</span>
        </div>
      </div>
      <div class="incoming">
        <h5>Incoming</h5>
        <div class="finance-item">
          <span class="finance-item-label">Income</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.incomingAtWeek(week - 1) || 0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.loanAtWeek(week - 1) || 0) }}</span>
        </div>
      </div>
      <div class="finance-item summary-item">
        <span class="finance-item-label">Total balance:</span>
        <span class="finance-item-value">{{ currencyFormat.format(financeStore.balanceAtWeek(week - 1)) }}</span>
      </div>
    </div>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { computed } from 'vue';
import { useFinanceStore } from '../../stores/financeStore';
import { useWeekStore } from '../../stores/weekStore';

const weekStore = useWeekStore();
const week = computed(() => weekStore.week);
const financeStore = useFinanceStore();

const currencyFormat = new Intl.NumberFormat('da-DK', {
  style: 'currency', currency: 'EUR'
});
</script>

<!-- Styling -->

<style scoped lang="postcss">
.finance-item {
  display: flex;
  justify-content: space-between;

  &.summary-item {
    font-weight: bold;
  }
}
</style>