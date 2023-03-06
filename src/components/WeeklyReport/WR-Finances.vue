<template>
  <div class="finances boxed">
    <h3>Finance</h3>
    <div class="weekly">
      <h4>Weekly</h4>
      <div class="outgoing">
        <h5>Outgoing</h5>
        <div class="finance-item">
          <span class="finance-item-label">Workers</span>
          <span class="finance-item-value">{{ (financeStore.workersTimeline[week - 1] || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Equipment</span>
          <span class="finance-item-value">{{ (financeStore.equipmentTimeline[week - 1] || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Overhead</span>
          <span class="finance-item-value">{{ (financeStore.overheadTimeline[week - 1] || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Consumables</span>
          <span class="finance-item-value">{{ (financeStore.consumablesTimeline[week - 1] || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Project delay penalty</span>
          <span class="finance-item-value">{{ (financeStore.delayPenaltyTimeline[week - 1] || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Interest loan</span>
          <span class="finance-item-value">{{ (financeStore.loanInterestTimeline[week - 1] || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Interest overdraft</span>
          <span class="finance-item-value">{{ (financeStore.overdraftInterestTimeline[week - 1] || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan payback</span>
          <span class="finance-item-value">{{ (financeStore.loanPaybackTimeline[week - 1] || 0).toFixed(0) }}</span>
        </div>
      </div>
      <div class="incoming">
        <h5>Incoming</h5>
        <div class="finance-item">
          <span class="finance-item-label">Income</span>
          <span class="finance-item-value">{{ (financeStore.incomingTimeline[week - 1] || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan</span>
          <span class="finance-item-value">{{ (financeStore.loanTimeline[week - 1] || 0).toFixed(0) }}</span>
        </div>
      </div>
      <div class="finance-item summary-item">
        <span class="finance-item-label">Weekly balance:</span>
        <span class="finance-item-value">{{ (financeStore.incomingTimeline[week - 1] || 0).toFixed(0) }}</span>
      </div>
    </div>
    <div class="total">
      <h4>Total</h4>
      <div class="outgoing">
        <h5>Outgoing</h5>
        <div class="finance-item">
          <span class="finance-item-label">Workers</span>
          <span class="finance-item-value">{{ (financeStore.workersAtWeek(week - 1) || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Equipment</span>
          <span class="finance-item-value">{{ (financeStore.equipmentAtWeek(week - 1) || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Overhead</span>
          <span class="finance-item-value">{{ (financeStore.overheadAtWeek(week - 1) || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Consumables</span>
          <span class="finance-item-value">{{ (financeStore.consumablesAtWeek(week - 1) || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Project delay penalty</span>
          <span class="finance-item-value">{{ (financeStore.delayPenaltyAtWeek(week - 1) || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Interest loan</span>
          <span class="finance-item-value">{{ (financeStore.loanInterestAtWeek(week - 1) || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Interest overdraft</span>
          <span class="finance-item-value">{{ (financeStore.overdraftInterestAtWeek(week - 1) || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan payback</span>
          <span class="finance-item-value">{{ (financeStore.loanPaybackAtWeek(week - 1) || 0).toFixed(0) }}</span>
        </div>
      </div>
      <div class="incoming">
        <h5>Incoming</h5>
        <div class="finance-item">
          <span class="finance-item-label">Income</span>
          <span class="finance-item-value">{{ (financeStore.incomingAtWeek(week - 1) || 0).toFixed(0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan</span>
          <span class="finance-item-value">{{ (financeStore.loanAtWeek(week - 1) || 0).toFixed(0) }}</span>
        </div>
      </div>
      <div class="finance-item summary-item">
        <span class="finance-item-label">Total balance:</span>
        <span class="finance-item-value">{{ (financeStore.incomingAtWeek(week - 1) || 0).toFixed(0) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFinanceStore } from '../../stores/financeStore';
import { useWeekStore } from '../../stores/weekStore';

const weekStore = useWeekStore();
const week = computed(() => weekStore.week);
const financeStore = useFinanceStore();
</script>

<style scoped lang="postcss">
.finance-item {
  display: flex;
  justify-content: space-between;

  &.summary-item {
    font-weight: bold;
  }
}
</style>