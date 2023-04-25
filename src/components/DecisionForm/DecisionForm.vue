<!-- 
  DecisionForm

  The DecisionForm is where player(s) make all their decisions for the coming week.
  Choices include: 
    Ordering equipment
    Hiring workers
    Allocating workers
    Taking/repaying a loan


-->

<template>
  <div class="decision-form">
    <h2 class="boxed section-title">Decision form for week: {{ weekStore.decisionForm }}</h2>
    <Bid class="bid boxed" />
    <Workers class="workers boxed" />
    <Equipment class="equipment boxed" />
    <Allocation class="allocation boxed" />
    <Loan class="loan boxed" />
    <NextWeek class="next-week-button"
              @week-progressed="weekStore.nextWeek()" />
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import Bid from './DF-Bid.vue';
import Workers from './DF-Workers.vue';
import Equipment from './DF-Equipment.vue';
import Loan from './DF-Loan.vue';
import Allocation from './DF-Allocation.vue';
import NextWeek from './DF-NextWeek.vue';
import { useWeekStore } from '../../stores/weekStore';

const weekStore = useWeekStore();
</script>

<!-- Styling -->

<style scoped lang="postcss">
.week-display {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.decision-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
  overflow: auto;
  max-height: 100%;

  .section-title {
    grid-column: span 2;
  }
}

.allocation,
.next-week-button,
.bid,
.loan {
  grid-column: span 2;
}
</style>