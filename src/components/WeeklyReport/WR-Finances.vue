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
      <h4>Daily</h4>
      <div class="outgoing">
        <h5>Outgoing</h5>
        <div class="finance-item">
          <span class="finance-item-label">Workers</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.workersTimeline.get(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Equipment</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.equipmentTimeline.get(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Overhead</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.overheadTimeline.get(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Consumables</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.consumablesTimeline.get(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Project delay penalty</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.delayPenaltyTimeline.get(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan interest</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.loanInterestTimeline.get(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Overdraft interest</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.overdraftInterestTimeline.get(week - 1)
            || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan repayment</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.loanRepayTimeline.get(week - 1) || 0)
          }}</span>
        </div>
      </div>
      <div class="incoming">
        <h5>Incoming</h5>
        <div class="finance-item">
          <span class="finance-item-label">Income</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.incomingTimeline.get(week - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan</span>
          <span class="finance-item-value">{{ currencyFormat.format((financeStore.loanTimeline.get(week - 1) || 0) -
            (financeStore.loanInterestTimeline.get(week - 1) || 0)) }}</span>
        </div>
      </div>
      <div class="finance-item summary-item">
        <span class="finance-item-label">Daily balance:</span>
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
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.workersTimeline.getReduced(week - 1) ||
            0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Equipment</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.equipmentTimeline.getReduced(week - 1) ||
            0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Overhead</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.overheadTimeline.getReduced(week - 1) ||
            0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Consumables</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.consumablesTimeline.getReduced(week - 1)
            || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Project delay penalty</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.delayPenaltyTimeline.getReduced(week - 1)
            || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan interest</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.loanInterestTimeline.getReduced(week - 1)
            || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Overdraft interest</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.overdraftInterestTimeline.getReduced(week
            - 1) || 0)
          }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan repayment</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.loanRepayTimeline.getReduced(week - 1) ||
            0)
          }}</span>
        </div>
      </div>
      <div class="incoming">
        <h5>Incoming</h5>
        <div class="finance-item">
          <span class="finance-item-label">Income</span>
          <span class="finance-item-value">{{ currencyFormat.format(financeStore.incomingTimeline.getReduced(week - 1) ||
            0) }}</span>
        </div>
        <div class="finance-item">
          <span class="finance-item-label">Loan (with interest)</span>
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
const financeStore = useFinanceStore();

const currencyFormat = new Intl.NumberFormat('en-UK', {
  style: 'currency', currency: 'EUR'
});

const props = defineProps<{
  week: number;
}>();
</script>

<!-- Styling -->

<style scoped lang="postcss">
.finance-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  &.summary-item {
    font-weight: bold;
  }
}
</style>